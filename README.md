# Screenshot Plugin for GLPI
[![CodeFactor](https://www.codefactor.io/repository/github/cconard96/glpi-screenshot-plugin/badge)](https://www.codefactor.io/repository/github/cconard96/glpi-screenshot-plugin)

Take a screenshot or screen recording directly from GLPI and attach it to a ticket, change or problem. Only works from the timeline for now.

This plugin should work on any modern desktop browser, but it won't work on mobile browsers.

Additionally, browsers only expose this feature when it is being used over HTTPS (or running over localhost). If your GLPI server doesn't use HTTPS yet, this plugin will not work.

![Preview](https://raw.githubusercontent.com/cconard96/glpi-screenshot-plugin/master/Screenshot%20Plugin%20Preview.gif)

## Locale Support
- Contribute to existing localizations on [POEditor](https://poeditor.com/join/project?hash=FBDufdxixj).
- To request new languages, please open a GitHub issue.

## Version Support

Multiple versions of this plugin are supported at the same time to ease migration.
Only 2 major versions will be supported at the same time (Ex: v1 and v2).
When a new minor version is released, the previous minor version will have support ended after a month.
Only the latest bug fix version of each minor release will be supported.

Note: There was no official version support policy before 2022-05-19.
The following version table may be reduced based on the policy stated above.

| Plugin Version | GLPI Versions | Start of Support | End of Support |
|----------------|---------------|------------------|----------------|
| 1.1.6          | 9.5.X         | 2021-11-15       | In Support     |
| 2.0.0          | 10.0.X        | 2022-04-20       | In Support     |
