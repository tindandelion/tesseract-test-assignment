import {User} from '../../src/core-types';
import {
  InMemoryDepositLedger,
  InMemoryUserRepository,
} from '../../src/impl/in-memory';
import {createApp} from '../../src/main';

export function createTestApp(initialUsers: User[] = []) {
  return createApp({
    userRepository: new InMemoryUserRepository(initialUsers),
    depositLedger: new InMemoryDepositLedger(),
  });
}
