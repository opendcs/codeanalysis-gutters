# Code analysis gutters

A tool to highlight lines and show other information relating to the results of various code analysis tools.

## Features

- Show [PMD-CPD](https://pmd.github.io/latest/pmd_userdocs_cpd.html) duplication information.
  - searches repository for xml files and checks if they contain a "pmd-cpd" root.
  - hover text has links to other files with the duplicate code.
  - highlights minor,major,critical based on number of tokens (not yet user configurable.)

## Requirements

No additional requirements.

## Extension Settings

No settings at this time.

## Known Issues

- I've just started this thing, it worked for my use-case. I'm quite sure it has problems.
- The color choice is terrible and doesn't account for themes. Help Welcome.

## Release Notes

Initial release.

### 0.0.3

- Generally usable. Can filter by different options to reduce cognitive load.

### 0.0.1

- Project start, baseline functionality.
