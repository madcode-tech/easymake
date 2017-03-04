# easymake
###### a preset-based task-runner

> You need to use presets, not easymake directly if you don't want to make your own preset

## lists of known presets
[List of known presets](https://github.com/madcode-tech/easymake/wiki) or search on npm "easymake preset"

## documentation
You can find documentation here https://github.com/madcode-tech/easymake/wiki

## mandatory configuration:

1. Select preset, set it as (**!important**) devDependency for your project (easymake will be installed with preset).
2. In package.json set preset name in config.easymake.preset (see below)
3. npm install
4. run tasks from preset with easymake (read a description of preset)

## configuration in package.json:
`{`

&nbsp;&nbsp;**"config"** `= {`

&nbsp;&nbsp;&nbsp;&nbsp;**"easymake"** `= {`

&nbsp;&nbsp;&nbsp;&nbsp;**"preset"** - *name of preset to use*

&nbsp;&nbsp;`}`

`}`

## commands:
+ `--help` - *help*
+ `--config-empty` - *copy empty configs (use for override some parameter in config files)*
+ `--config-default` - *copy preset configs (inspect what contains a preset)*

+ `--run <task name>` - *run task*

+ `--production` - *setting flag in environment that task run for production (tasks can use this flag if they need them)*

+ `--mode <String>` - *setting mode flag for task-environment (tasks can use this flag if they need them)*
+ `--environment <String>` - *setting "environment" flag in task running environment (tasks can use this flag if they need them)*
