import { Button, Form, Input, Popconfirm, Space, Table, Typography } from "antd";
import { useState, useRef } from "react";
import type { InputRef } from 'antd';
import { EditableCell } from "../editable";
import { AddModal } from "./add";
import { useGetAPI, usePutAPI } from "../hooks/useAPI";
import { useSession } from "next-auth/react";
import { PurchasedModal } from "./purchased";
import { ColumnType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from 'react-highlight-words';
import didYouMean, { ReturnTypeEnums } from 'didyoumean2';

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
const ownerColumns = ["img", "title", "quantity", "link"];
const searchableColumns = ["title"];
const columnWidths: Record<string, string> = {
  img: "25%",
  title: "35%",
  quantity: "20%",
  link: "20%",
}
const { Column } = Table;

export const AddView = ({ userToView }: { userToView?: string }) => {
  const { data: session } = useSession();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);
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

  const getColumnSearchProps = (dataIndex: string): ColumnType<Item> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSearchText(e.target.value);
            setSelectedKeys([e.target.value]);
          }}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
        <Button
            type="link"
            size="small"
            onClick={() => {
              setSearchText('');
              setSelectedKeys([]);
              clearFilters?.();
            }}
          >
            clear
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} rev={undefined}/>
    ),
    onFilter: (value, record: Record<string, any>) => {
      const valueArray = record[dataIndex].toLowerCase().split(' ');
      const suggestions = didYouMean(searchText.toLowerCase(), valueArray, { returnType: ReturnTypeEnums.ALL_SORTED_MATCHES });
      const inAWord = valueArray.find((word: string) => word.indexOf(searchText.toLowerCase()) > -1);
      return suggestions.length > 0 || !!inAWord || !searchText;
    },
    
      // record[dataIndex]
      //   .toString()
      //   .toLowerCase()
      //   .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns: Record<string, any> = (
    isOwner ? ownerColumns : defaultColumns
  ).map((columnKey) => {
    return {
      title: columnKey,
      dataIndex: columnKey,
      key: columnKey,
      required: false,
      width: columnWidths[columnKey],
      defaultSortOrder: "descend",
      ...(searchableColumns.indexOf(columnKey) >-1 && getColumnSearchProps(columnKey)),
      //onFilter: (value, record) => {const suggestions = didYouMean(value, record[columnKey].split(' ')); console.log("**** suggestions", suggestions);},
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
        const { quantity = 1, purchased = 0 } = record;
        return (
          <Typography.Link
            disabled={record.purchased! >= record.quantity!}
            onClick={() => showPurchased(record)}
          >
            {quantity! <= purchased! ? "Already purchased" : "Mark as purchased"}
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
          style={{
            cursor: "pointer"
          }}
          pagination={{
            pageSize: 10,
          }}
          expandable={{
            expandedRowRender: (record) => <p>
              {record.description}
            </p>,
            rowExpandable: (record) => !!record.description,
            expandRowByClick: true,
            fixed: true,
            showExpandColumn: false
          }}
          rowKey={(record) => record.id}
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
