
import 'dotenv/config'
import app from './app';
import { checkTableExistOrNot } from './common/common';

const port = process.env.PORT || 3001;

app.listen(port, () => {
  checkTableExistOrNot()
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});