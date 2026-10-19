// import = bring in code from another file or package
// z = Zod: describe the shape of data and check it
import { z } from 'zod';

// export = other files can import this
// const = a name for a value that is never reassigned
// z = Zod: describe the shape of data and check it
// z.object = an object with these fields
export const productIdParams = z.object({
  // z = Zod: describe the shape of data and check it
  // z.string = must be text
  // .min = at least this many (characters, or this value)
  productId: z.string().min(1),
});
