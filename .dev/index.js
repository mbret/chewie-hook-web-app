'use strict'

// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually lift from.
process.chdir(__dirname)

const System = require('chewie-system').System

// Start the system
const chewie = new System()
chewie.start()