#!/usr/bin/env python
import logging
logger = logging.getLogger(__name__)

import sys
import os
import shutil
import argparse
import re

logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)


class PatchError(Exception):
    pass


class Value(object):
    def __init__(self, str):
        str = str.strip()
        if str.startswith('0x'):
            str = str[2:]
            if len(str) % 2 != 0:
                str = '0' + str
            parts = [ str[i:i + 2] for i in range(0, len(str), 2) ]
            self.value = ''.join(chr(int(part, 16)) for part in parts)
            self.type = 'binary'
        elif str[0] == '"' and str[-1] == '"':
            self.value = str[1:-1]
            self.type = 'string'
        else:
            raise PatchError('invalid value %s' % str)

    @classmethod
    def render(cls, value, type):
        if type == 'binary':
            return '0x%s' % ''.join('%x' % ord(s) for s in value)
        elif type == 'string':
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
    def parse(self, line):
        line = line.strip()
        line = line.split('#')[0]
        if not line:
            return
        parts = re.findall(r'(?:[^\s,"]|"(?:\\.|[^"])*")+', line)
        (address, expected, byte) = parts

        return Patch(int(address, 16), Value(expected), Value(byte))

    def __repr__(self):
        return "Patch(0x%x, %s, %s)" % (self.address, self.expected, self.actual)


class Patcher(object):
    def __init__(self, patch_filename, base=None, force=False):
        self.patches = self._read_patches(patch_filename)
        self.base = int(base or '0x00', 16)
        self.force = force

    def _read_patches(self, patch_filename):
        patches = []
        with open(patch_filename) as file:
            for line in file.readlines():
                patch = Patch.parse(line)
                if patch:
                    patches.append(patch)
        return patches

    def _backup_filenames(self, filename):
        yield '%s.bak' % filename
        for i in range(1, 10):
            yield '%s.bak.%s' % (filename, i)

    def backup(self, binary_filename):
        for filename in self._backup_filenames(binary_filename):
            if not os.path.exists(filename):
                shutil.copy2(binary_filename, filename)
                return
        raise PatchError('could not backup')

    def patch(self, binary_filename, dry_run=False):
        with open(binary_filename, 'r+b') as file:
            for patch in self.patches:
                patch.patch(file, force=self.force, dry_run=dry_run)

    def __repr__(self):
        return "Patcher(0x%x, %s)" % (
            self.base,
            ", ".join(str(patch) for patch in self.patches),
        )


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', action='store', dest='base')
    parser.add_argument('--dry-run', action='store_true', dest='dry_run')
    parser.add_argument('--force', action='store_true', dest='force')
    parser.add_argument('patch')
    parser.add_argument('input')
    options = parser.parse_args()
    patcher = Patcher(options.patch, base=options.base, force=options.force)
    logger.info("found %s patches" % len(patcher.patches))
    if not options.dry_run:
        patcher.backup(options.input)
    patcher.patch(options.input, dry_run=options.dry_run)
    logger.info('applied %s patches' % len(patcher.patches))
    sys.exit(0)
