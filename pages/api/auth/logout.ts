import type { NextApiRequest, NextApiResponse } from 'next';

const logout = (req: NextApiRequest, res: NextApiResponse) => {
  // res('token');
  console.log('Hello from logout.ts');
  res.json({
    message: 'Logged out dummy',
  });
};

export default logout;
