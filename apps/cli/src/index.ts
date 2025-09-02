#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('deva')
  .description('CLI tool for Deva - Intelligent development assistant for Linear')
  .version('0.1.0');

program
  .command('create')
  .description('Create a new Linear issue from natural language')
  .argument('<description>', 'Description of the issue')
  .action(async (description: string) => {
    console.log(chalk.blue('Creating issue:'), description);
    // TODO: Implement issue creation logic
  });

program
  .command('chat')
  .description('Start interactive chat mode')
  .action(async () => {
    console.log(chalk.green('Starting Deva chat mode...'));
    // TODO: Implement interactive chat
  });

program
  .command('config')
  .description('Configure Deva settings')
  .action(async () => {
    console.log(chalk.yellow('Opening configuration...'));
    // TODO: Implement configuration
  });

program.parse();