export function before(callback: Function): any;
export function after(callback: Function): any;
export function track(callback: Function): any;
export function composeWith(convergeFn: Function, ops: Array<any>|any): any;
export function createCounter(): any;
export function time(callback: Function): any;
export function evolve(obj: Object): any;
export function identity(callback: Function): any;
export function nop(): void;
export function once(callback: Function): any;

export default {
  before,
  after,
  track,
  composeWith,
  createCounter,
  time,
  evolve,
  identity,
  nop,
  once
};
