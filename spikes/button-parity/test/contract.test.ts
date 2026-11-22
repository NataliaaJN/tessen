import { buttonContract } from '../src/core/button.contract.ts';
import { reactAdapter } from './react.adapter.tsx';
import { runContract } from './runner.ts';
import { vueAdapter } from './vue.adapter.ts';

// P2: the very same cases, as data, executed with each framework's native harness.
runContract(buttonContract, vueAdapter);
runContract(buttonContract, reactAdapter);
