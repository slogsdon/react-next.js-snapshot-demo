import Head from 'next/head';
import Link from 'next/link';

export default () => (
  <div>
    <Head>
      <meta name='viewport' content='width=device-width, initial-scale=1'/>
    </Head>
    <h1>About</h1>

    <Link href="/"><a>Index</a></Link>
  </div>
);