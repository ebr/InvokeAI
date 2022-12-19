'''
ldm.invoke.globals defines a small number of global variables that would
otherwise have to be passed through long and complex call chains.

It defines a Namespace object named "Globals" that contains
the attributes:

  - root           - the root directory under which e.g. "models" and "outputs" can be found
  - initfile       - path to the initialization file
  - outdir         - output directory
  - config         - models config file
  - try_patchmatch - option to globally disable loading of 'patchmatch' module
'''

from argparse import Namespace
from .paths import InvokePaths

Globals = Namespace()
Paths = InvokePaths()

Globals.root = Paths.root
Globals.initfile = Paths.initfile
Globals.outdir = Paths.outdir
Globals.config = Paths.config

Globals.try_patchmatch = True

Globals.debug = False
