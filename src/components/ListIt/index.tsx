import { Select, Space } from 'antd';
import { useState, useCallback } from 'react';
import { useGetAPI, usePutAPI } from './hooks/useAPI';
import { useSession } from 'next-auth/react';
import { AddView } from "./add";

export interface Item {
  key: string;
  title: string;
  description?: string;
  quantity?: number;
  purchased?: number;
  tags?: string[];
  img?: string;
  link?: string;
}

export const ListIt = () => {
  const { data: session } = useSession();
  const {data} = useGetAPI(session?.user?.email);
  const { postRequest } = usePutAPI();

  const [showLink, setShowLink] = useState(false);
  const [selectedView, setSelectedView] = useState();
  const [userToView, setUserToView] = useState<string | undefined>(session?.user?.email ?? undefined);

  const handleViewUser = useCallback((val: string) => {
    setUserToView(val);
  }, [userToView, setUserToView]);
  
  return <><Space size="small">
    <Select onChange={handleViewUser} placeholder="Select a user to view a list"
      options={[
        {value: "alan@alan-cruz.com", label: "Alan"},
        {value: "wilfrido@alan-cruz.com", label: "Lolo"},
        {value: "chona@alan-cruz.com", label: "Lola"},
        {value: "cesi@alan-cruz.com", label: "Cesi"},
        {value: "rob@alan-cruz.com", label: "Rob"},
        {value: "theo@alan-cruz.com", label: "Theo"},
        {value: "henry@alan-cruz.com", label: "Henry"},
        {value: "rico@alan-cruz.com", label: "Rico"},
        {value: "melissa@alan-cruz.com", label: "Melissa"},
        {value: "mina@alan-cruz.com", label: "Mina"},
        {value: "ness@alan-cruz.com", label: "Ness"},
      ]}
      defaultValue={session?.user?.email}
    />
  </Space>
  <AddView userToView={userToView} key={userToView} />
  </>
};

// title: 'John',
// description: 'Brown',
// quantity: 2,
// purchased: 1,
// tags: ['loser'],
