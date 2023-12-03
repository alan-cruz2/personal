import { Button, Form, Popconfirm, Table, Typography } from "antd";
import { useState } from "react";
import { EditableCell } from "../editable";
import { AddModal } from "./add";
import { useGetAPI, usePutAPI } from "../hooks/useAPI";
import { useSession } from "next-auth/react";
import { PurchasedModal } from "./purchased";
import { ColumnType } from "antd/es/table";

export interface Item {
  key: string;
  title: string;
  description?: string;
  quantity?: number;
  purchased?: number;
  tags?: string[];
  img?: string;
  link?: string;
  id?: string;
}

const defaultColumns = [
  "img",
  "title",
  "description",
  "quantity",
  "purchased",
  "link",
];
const ownerColumns = ["img", "title", "description", "quantity", "link"];
const { Column } = Table;

export const AddView = ({ userToView }: { userToView?: string }) => {
  const { data: session } = useSession();
  const { data = [], refresh } = useGetAPI(userToView ?? session?.user?.email);

  const isOwner = userToView === session?.user?.email;
  const { postRequest } = usePutAPI();

  const [editingKey, setEditingKey] = useState<string | undefined>("");
  const [form] = Form.useForm();
  const isEditing = (record: Partial<Item>) => record?.id === editingKey;

  const edit = (record: Partial<Item> & { key?: React.Key }) => {
    setEditingKey(record?.id);
  };

  const [showPurchasedModal, setShowPurchasedModal] = useState(false);
  const [itemForPurchase, setItemForPurchase] = useState<
    Partial<Item> | undefined
  >();

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key: React.Key | undefined) => {
    try {
      const original = data.find((item: Item) => item.id === editingKey) ?? {};
      const editedItem = await form.getFieldsValue();
      await postRequest(JSON.stringify({ ...original, ...editedItem }));
      setEditingKey("");
      refresh();
    } catch (err) {
      console.log("Validate Failed:", err);
    }
  };

  const columns: Record<string, any> = (
    isOwner ? ownerColumns : defaultColumns
  ).map((columnKey) => {
    return {
      title: columnKey,
      dataIndex: columnKey,
      key: columnKey,
      required: false,
      defaultSortOrder: "descend",
      sorter: (a: Record<string, any>, b: Record<string, any>) => {
        if (a[columnKey] < b[columnKey]) {
          return -1;
        }
        if (a[columnKey] > b[columnKey]) {
          return 1;
        }
        return 0;
      },
      onCell: (record: Item) => ({
        title: columnKey,
        dataIndex: columnKey,
        key: record?.key ?? Date.now(),
        editing: isEditing(record),
        record,
        required: false,
        hidden: columnKey === "id",
        isOwner,
      }),
    };
  });

  const showPurchased = (record: Partial<Item>) => {
    setItemForPurchase(record);
    setShowPurchasedModal(true);
  };

  const hidePurchased = () => {
    setItemForPurchase(undefined);
    setShowPurchasedModal(false);
  };

  columns.push({
    title: isOwner ? "edit" : "I bought this",
    key: isOwner ? "edit" : "purchased",
    render: (_: any, record: Partial<Item>) => {
      if (isOwner) {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.id)}
              style={{ marginRight: 8 }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link
            disabled={editingKey !== ""}
            onClick={() => edit(record)}
          >
            Edit
          </Typography.Link>
        );
      } else {
        const { quantity, purchased } = record;
        return (
          <Typography.Link
            disabled={record.purchased === record.quantity}
            onClick={() => showPurchased(record)}
          >
            {quantity === purchased ? "Already purchased" : "Mark as purchased"}
          </Typography.Link>
        );
      }
    },
  });

  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setOpen(false);
  };

  const handleSave = async (
    newItems: Partial<Item & { user: string | null | undefined }>[]
  ) => {
    const promises = newItems.map((newItem) => {
      newItem.user = session?.user?.email;
      setConfirmLoading(true);
      return postRequest(JSON.stringify(newItem));
    });

    Promise.all(promises).then(() => {
      refresh();
      setOpen(false);
    });
  };

  const handlePurchaseSave = (item: any) => {
    postRequest(JSON.stringify(item));
    hidePurchased();
  };

  const [showLink, setShowLink] = useState(false);

  return (
    <>
      <Form form={form} component={false}>
        <Table
          dataSource={data}
          components={{ body: { cell: EditableCell } }}
          columns={columns as ColumnType<Record<string, any>>[]}
          rowClassName={(record) => {
            const { quantity, purchased } = record;
            return quantity === purchased ? "all-gone" : "";
          }}
          pagination={{
            pageSize: 4,
          }}
        />
        {isOwner && (
          <Form.Item wrapperCol={{ offset: 12, span: 12 }}>
            <Button type="primary" onClick={showModal}>
              Add an item
            </Button>
          </Form.Item>
        )}
      </Form>
      {
        <AddModal
          confirmLoading={confirmLoading}
          open={open}
          handleCancel={handleCancel}
          closeIcon={false}
          handleSave={handleSave}
        />
      }
      {
        <PurchasedModal
          confirmLoading={false}
          open={showPurchasedModal}
          handleCancel={() => hidePurchased()}
          handleSave={handlePurchaseSave}
          item={itemForPurchase}
        />
      }
    </>
  );
};
