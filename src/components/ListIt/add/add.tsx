import { Modal, Button, Flex, Space, Input, Divider, Image, Typography } from "antd";
import { useState, useCallback } from "react";
import {
  ZoomInOutlined,
  ZoomOutOutlined, SelectOutlined
} from "@ant-design/icons";
const { Text } = Typography;

export const AddModal = (props: Record<string, any>) => {
  const {
    confirmLoading,
    open,
    handleCancel,
    handleSave
  } = props;

  const [visibleImage, setVisibleImage] = useState<string>();
  const [images, setImages] = useState<string[]>();
  const [scrapingError, setScrapingError] = useState<string>();
  const [linkProcessing, setLinkProcessing] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    quantity: 1,
    keywords: '',
    img: '',
    purchased: 0,
    link: ''
  });

  const setTitle = useCallback((event: { target: { value: any; }; }) => {
    const val = event.target.value;
    setNewItem({
      ...newItem,
      title: val,
    });
  }, [newItem, setNewItem]);

  const setDescription = useCallback((event: { target: { value: any; }; }) => {
    const val = event.target.value;
    setNewItem({
      ...newItem,
      description: val,
    });
  }, [newItem, setNewItem]);

  const setQuantity = useCallback((event: { target: { value: any; }; }) => {
    const val = event.target.value;
    setNewItem({
      ...newItem,
      quantity: val,
    });
  }, [newItem, setNewItem]);

  const setLink = useCallback((event: { target: { value: any; }; }) => {
    const link = event?.target?.value ?? event;
    console.log("**** link", link, event);
    setNewItem({
      ...newItem,
      link,
    });
  }, [newItem, setNewItem]);
  
  const onLinkPaste = useCallback((value: string | URL) => {
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
              setImages(images);
              setNewItem({
                ...newItem,
                title,
                description,
                img: images?.[0],
                link: url.toString(),
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
        link: ''
      });
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
      {images && <div style={{ height: "min-content" }}>
        <strong>Select the image you would like to use?</strong><br/><em>the current image will be highlighted in <span style={{color: "red"}}>red</span></em>
        <div style={{height: "250px", overflow: "auto"}}>
          <Flex wrap="wrap" gap="small">
          {images.map((image, index) => <Image
            style={{
              border: image === newItem.img ? "2px solid red" : "none",
            }}
            alt="image option"
            key={image}
            width={image === newItem.img ? 100 : 50}
            src={image}
            onClick={() => setVisibleImage(image)}
            preview={{
              visible: image === visibleImage,
              toolbarRender: (_, { actions: { onZoomOut, onZoomIn}}) => {
                return <Space size={40}>
                  <ZoomOutOutlined alt="zoom out" onClick={onZoomOut} style={{ fontSize: "50px", marginBottom: "20px" }} width={500} rev={undefined} />
                  <Space direction="vertical" onClick={() => {
                    setNewItem({
                      ...newItem,
                      img: images?.[index],
                    });
                    setVisibleImage(undefined);
                  }
                    }>
                    <SelectOutlined alt="select image" id="select-icon" style={{ fontSize: "50px" }} label="Use this image" width={500} rev={undefined} />
                    <label>Select</label></Space>
                  <ZoomInOutlined alt="zoom in" width={500} style={{ fontSize: "50px", marginBottom: "20px" }} onClick={onZoomIn} rev={undefined} />
                </Space>
              },
              onVisibleChange: (value) => {
                if (!value) {
                  setVisibleImage(undefined);
                }
              },
            }}
          />)}
      </Flex>
        </div>
        </div>}
    </Space>

  </Space>

</Modal>
};