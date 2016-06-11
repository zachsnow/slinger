#!/usr/bin/env python
"""
    patch.py - a simple Python script for applying binary patches.
"""
import logging
import sys
import os
import shutil
import argparse
import re
from string import Template

logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)
logger = logging.getLogger(__name__)


class PatchError(Exception):
    pass


class Context(object):
    def __init__(self, **kwargs):
        self.context = kwargs

    def __getitem__(self, key):
        return self.context[key]

    def get(self, key, default=None):
        return self.context.get(key, default)

    @classmethod
    def parse(cls, input):
        context = {}
        for part in input:
            part = part.strip()
            if not part:
                continue
            parts = part.split('=', 1)
            if len(parts) != 2:
                raise PatchError('bad syntax near "%s"' % part)
            (key, value) = parts
            if key in context:
                raise PatchError('variable %s defined multiple times' % key)
            context[key] = value
        return Context(**context)

    def __str__(self):
        return str(self.context)


class Value(object):
    BINARY = 'binary'
    STRING = 'string'

    def __init__(self, value, type):
        self.value = value
        self.type = type

    @classmethod
    def parse(cls, value):
        value = value.strip()

        if value.startswith('0x'):
            value = value[2:]
            if len(value) % 2 != 0:
                value = '0' + value
            parts = [ value[i:i + 2] for i in range(0, len(value), 2) ]
            return Value(''.join(chr(int(part, 16)) for part in parts), cls.BINARY)

        elif value[0] == '"' and value[-1] == '"':
            return Value(value[1:-1], cls.STRING)

        else:
            raise PatchError('invalid value %s' % value)

    @classmethod
    def render(cls, value, type):
        if type == cls.BINARY:
            return '0x%s' % ''.join('%x' % ord(s) for s in value)
        elif type == cls.STRING:
            return '"%s"' % value
        else:
            raise PatchError('invalid type %s' % type)

    def __str__(self):
        return self.render(self.value, self.type)

    def __len__(self):
        return len(self.value)


class Patch(object):
    def __init__(self, address, expected, actual):
        self.address = address
        self.expected = expected
        self.actual = actual

    def patch(self, file, force=False, dry_run=False):
        file.seek(self.address)
        expected = file.read(len(self.expected))
        if self.actual.value.startswith(expected):
            logger.warn('0x%x: possibly patched, found %s' % (
                self.address,
                Value.render(expected, self.expected.type),
            ))

        elif expected != self.expected.value:
            logger.error('0x%x: expected %s, found %s' % (
                self.address,
                self.expected,
                Value.render(expected, self.expected.type),
            ))
            if not force:
                return

        if dry_run:
            logger.info('0x%x: dry run, not writing %s' % (self.address, self.actual))
        else:
            file.seek(self.address)
            file.write(self.actual.value)
            logger.info('0x%x: wrote %s' % (self.address, self.actual))

    @classmethod
    def parse(cls, line, context):
        line = line.strip()
        line = line.split('#')[0]
        if not line:
            return

        # Perform template substitution.
        context = context or Context()
        line = Template(line).safe_substitute(context)

        parts = re.findall(r'(?:[^\s,"]|"(?:\\.|[^"])*")+', line)
        (address, expected, byte) = parts

        return Patch(int(address, 16), Value.parse(expected), Value.parse(byte))

    def __repr__(self):
        return "Patch(0x%x, %s, %s)" % (self.address, self.expected, self.actual)


class Patcher(object):
    def __init__(self, patch_filename, context=None):
        self.context = context or Context()
        self.patches = self._read_patches(patch_filename)

    def _read_patches(self, patch_filename):
        patches = []
        with open(patch_filename) as file:
            for line in file.readlines():
                patch = Patch.parse(line, self.context)
                if patch:
                    patches.append(patch)
        return patches

    @classmethod
    def _backup_filenames(cls, filename):
        yield '%s.bak' % filename
        for i in range(1, 10):
            yield '%s.bak.%s' % (filename, i)

    def backup(self, binary_filename):
        for filename in self._backup_filenames(binary_filename):
            if not os.path.exists(filename):
                shutil.copy2(binary_filename, filename)
                return
        raise PatchError('could not backup')

    def patch(self, binary_filename, force=False, dry_run=False):
        with open(binary_filename, 'r+b') as file:
            for patch in self.patches:
                patch.patch(file, force=force, dry_run=dry_run)

    def __repr__(self):
        return "Patcher(%s)" % (
            ", ".join(str(patch) for patch in self.patches),
        )


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', action='store', dest='base')
    parser.add_argument('--dry-run', action='store_true', dest='dry_run')
    parser.add_argument('--force', action='store_true', dest='force')
    parser.add_argument('patch')
    parser.add_argument('input')
    parser.add_argument("context", nargs=argparse.REMAINDER)
    options = parser.parse_args()
    try:
        context = Context.parse(options.context)
        patcher = Patcher(options.patch, context=context)
        logger.info("found %s patches" % len(patcher.patches))
        if not options.dry_run:
            patcher.backup(options.input)
        patcher.patch(options.input, force=options.force, dry_run=options.dry_run)
        logger.info('applied %s patches' % len(patcher.patches))
        sys.exit(0)
    except PatchError as e:
        logger.error('unable to patch: %s' % e)
        sys.exit(-1)
