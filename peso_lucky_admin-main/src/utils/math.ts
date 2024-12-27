import { create, all } from 'mathjs';
const math = create(all, {
  epsilon: 1e-12,
  matrix: 'Matrix',
  number: 'BigNumber', // 可选值：number BigNumber
  precision: 64,
  predictable: false,
  randomSeed: null,
});
export default math;
