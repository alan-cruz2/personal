import { Modal, Button, InputNumber, Typography } from "antd";
import { useState, useCallback } from "react";
const { Text } = Typography;

export const PurchasedModal = (props: Record<string, any>) => {
  const {
    confirmLoading,
    open,
    handleCancel,
    handleSave,
    item,
  } = props;
  console.log("**** item", item);

  const [localItem, setLocalItem] = useState({...item});

  const setPurchased = useCallback((val: any) => {
    setLocalItem({
      ...item,
      purchased: val,
    });
  }, [item, setLocalItem]);

  const savePurchased = useCallback(() => {
    handleSave(localItem);
  }, [localItem]);

  return <Modal
  title="How many did you buy?"
  open={open}
  confirmLoading={confirmLoading}
  footer={[
    <Button key="back" onClick={() => {
      handleCancel();
    }}>
      Cancel
    </Button>,
    <Button key="submit" type="primary" onClick={savePurchased}>
      Save
    </Button>
  ]}
>
    <div>
    <InputNumber placeholder="how many?" addonBefore="Title" onChange={setPurchased} max={localItem.quantity}/>
    </div>

</Modal>
};