import React from 'react';
import { Form, Input, Image, Button } from 'antd';
import { Item } from '.';

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  index: number;
  children: React.ReactNode;
  link?: string;
  isOwner?: boolean;
}

export const EditableCell: React.FC<EditableCellProps> = (props) => {
  
  const {
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    isOwner,
    ...restProps
  } = props;
  console.log("**** id", title);
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          initialValue={(record as Record<string, any>)?.[dataIndex]}
          preserve={false}
        >
          <Input key={`${title}-${dataIndex}`} />
        </Form.Item>
      ) : (
        record?.img && dataIndex === "img" ? <Image height={100} src={record?.img ?? ""} /> : 
        !!title && record?.quantity === record?.purchased && !isOwner ? <s>{children}</s> :
        title === "link" ? <Button href={record?.link} target='_blank'>Link</Button> : children
      )}
    </td>
  );
};