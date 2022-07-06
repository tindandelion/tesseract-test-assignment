import {Sequelize} from 'sequelize';
import {
  initModels,
  SqlDepositLedger,
  SqlUserRepository,
} from './impl/sql-repositories';
import {createApp} from './main';

async function createRepositories() {
  const sequelize = new Sequelize('sqlite::memory:', {logging: false});
  initModels(sequelize);
  await sequelize.sync();
  return {
    userRepository: new SqlUserRepository(),
    depositLedger: new SqlDepositLedger(),
  };
}

createRepositories().then(({userRepository, depositLedger}) => {
  const app = createApp({
    userRepository,
    depositLedger,
  });
  app.listen(3000, () => {
    console.log('Server is up');
  });
});
