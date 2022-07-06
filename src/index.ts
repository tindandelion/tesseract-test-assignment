import { InMemoryDepositLedger, InMemoryUserRepository } from './impl/in-memory';
import {createApp} from './main';

const app = createApp({ 
  userRepository: new InMemoryUserRepository([]),
  depositLedger: new InMemoryDepositLedger()
});

app.listen(3000, () => {
  console.log('Server is up');
});
