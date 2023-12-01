import Head from "next/head";
import { Tabs, Button, Divider } from "antd";
import { ListIt } from "../components/ListIt";
import { useSession, signOut, signIn } from "next-auth/react";

const keys = [
  'list',
  'bake',
  'collect'
];

const items = [
  {
    label: 'List It',
    key: keys[0],
    children: <ListIt />
  },
  {
    label: 'Bake It',
    key: keys[1],
    children: <ListIt />,
    disabled: true
  },
  {
    label: 'Play/Collect It',
    key: keys[2],
    children: <ListIt />,
    disabled: true
  },
];

export default function Home() {
  const onSelect = (key) => {
    console.log("**** key", key);
  };

  const { data: session } = useSession();
  console.log("**** session", session);

  if (!session || !session.user) {
    return <Button onClick={signIn}>Sign In</Button>
  }

  return (
    <>
      <Head>
        <meta name="description" content="Cruz" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/favicon-studios-32x32.png" />
      </Head>
      <Button onClick={signOut}>Sign Out {session?.user?.email}</Button>
      <Divider />
      <Tabs
        theme="dark"
        items={items}
        onChange={onSelect}
      />
    </>
  );
}
