import { Modal, Button, Space, Input, Divider, Image, Typography } from "antd";
import { useState, useCallback } from "react";
const { Text } = Typography;

export const AddModal = (props) => {
  const {
    confirmLoading,
    open,
    handleCancel,
    handleSave
  } = props;

  const [showLink, setShowLink] = useState(false);
  const [scrapingError, setScrapingError] = useState<string>();
  const [linkProcessing, setLinkProcessing] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    quantity: 1,
    keywords: '',
    img: '',
    purchased: 0,
  });

  const setTitle = useCallback((event) => {
    const val = event.target.value;
    setNewItem({
      ...newItem,
      title: val,
    });
  }, [newItem, setNewItem]);

  const setDescription = useCallback((event) => {
    const val = event.target.value;
    setNewItem({
      ...newItem,
      description: val,
    });
  }, [newItem, setNewItem]);

  const setQuantity = useCallback((event) => {
    const val = event.target.value;
    setNewItem({
      ...newItem,
      quantity: val,
    });
  }, [newItem, setNewItem]);

  const setLink = useCallback((event) => {
    const link = event?.target?.value ?? event;
    console.log("**** link", link, event);
    setNewItem({
      ...newItem,
      link,
    });
  }, [newItem, setNewItem]);
  
  const onLinkPaste = useCallback((value) => {
    try {
      const url = new URL(value);
      const body = { link: value };

      if (url) {
        setScrapingError(undefined);
        setLinkProcessing(true);
        fetch('/api/meta', {
          method: 'POST',
          body: JSON.stringify(body)
        })
          .then(response => response.json())
          .then(data => {
            const { title, description, images, errorMsg } = data;
            if (errorMsg) {
              setScrapingError(errorMsg);
            } else {
            
              setNewItem({
                ...newItem,
                title,
                description,
                img: images?.[0],
                link: url,
              });
            }
            setLinkProcessing(false);
          }).catch(error => {
            console.log("**** error", error);
            setLinkProcessing(false);
          })
      }
    } catch (error) {
      console.log("**** not a url");
    }
  }, [newItem]);

  return <Modal
  title="Add new item"
  open={open}
  confirmLoading={confirmLoading}
  footer={[
    <Button key="back" onClick={() => {
      setNewItem({
        title: '',
        description: '',
        quantity: 1,
        keywords: '',
        img: '',
        purchased: 0,
      });
      setShowLink(false);
      setLinkProcessing(false);
      handleCancel();
    }}>
      Cancel
    </Button>,
    <Button key="submit" type="primary" onClick={() => handleSave(newItem)}>
      Add item
    </Button>
  ]}
>
  <Space direction="vertical">
    <Input.Search placeholder="url" addonBefore="Gather details from amazon (beta)" onSearch={onLinkPaste} loading={linkProcessing} enterButton="Scrape"/>
    {scrapingError && <Text type="danger">{scrapingError}</Text>}
    <Divider />

    <Space>

      <div>
        <Input placeholder="name/title" addonBefore="Title" value={newItem.title} onChange={setTitle}/>
        <Input placeholder="description" addonBefore="Description" value={newItem.description} onChange={setDescription}/>
        <Input placeholder="quantity" addonBefore="How many" value={newItem.quantity} onChange={setQuantity}/>
        <Input placeholder="link (will not scrape)" addonBefore="Link" value={newItem.link} onChange={setLink} />
      </div>
      {newItem.img && <div>
        <Image width="100%" src={newItem.img} />
      </div>}
    </Space>

  </Space>

</Modal>
};