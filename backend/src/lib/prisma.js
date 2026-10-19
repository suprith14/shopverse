// import = bring in code from another file or package
import { PrismaClient } from '@prisma/client';

// One shared database client for the whole app (each client holds a connection pool).
// export = other files can import this
// const = a name for a value that is never reassigned
// new = create an object from a class (e.g. new Date())
export const prisma = new PrismaClient();
