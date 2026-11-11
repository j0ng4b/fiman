import { TestProject } from 'vitest/node';

export default async function setup(project: TestProject) {
    return async function teardown() {};
}
