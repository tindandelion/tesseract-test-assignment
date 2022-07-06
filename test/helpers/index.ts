import {User} from '../../src/app/core-types';
import {
  InMemoryDepositLedger,
  InMemoryUserRepository,
} from '../../src/impl/in-memory-repositories';
import {createApp} from '../../src/app/main';

export function createTestApp(initialUsers: User[] = []) {
  return createApp({
    userRepository: new InMemoryUserRepository(initialUsers),
    depositLedger: new InMemoryDepositLedger(),
  });
}
