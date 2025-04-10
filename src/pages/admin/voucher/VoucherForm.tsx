import { DatePicker, Form, Input } from "antd";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  addVoucher,
  getVoucher,
  updateVoucher,
  updateVoucherFromAdmin,
} from "../../../services/voucher";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

const VoucherForm = () => {
  const [form] = Form.useForm();
  const [expirationDate, setExpirationDate] = useState([dayjs(), dayjs()]);
  const { RangePicker } = DatePicker;
  const next = useNavigate();
  const { id } = useParams();


  let mode = "add";
  if (id) mode = "update";

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await getVoucher(id);
          const expirationDate = res?.data?.expirationDate;
          // console.log('date', expirationDate);
          setExpirationDate([dayjs(expirationDate[0]), dayjs(expirationDate[1])]);
          console.log('time', expirationDate);
          form.setFieldsValue(res?.data);
        } catch (error) {
          console.error('Error fetching voucher:', error);
        }
      })();
    }
  }, []);

  const onChange = (date, dateString) => {
    setExpirationDate(date);
  };

  const onFinish = async (values: any) => {
    try {
      if (mode == "add") {
        const res = await addVoucher({
          ...values,
          code: values?.code.toLocaleUpperCase(),
          expirationDate: expirationDate
        })
        // console.log(res)

        Swal.fire({
          title: "Tạo voucher thành công!",
          icon: "success",
        });
        next("/admin/voucher");
      } else {
        const res = await updateVoucher(id, {
          ...values,
          code: values?.code.toLocaleUpperCase(),
          expirationDate: expirationDate
        })

        // Cập nhật lại code mà user đã lưu
        await updateVoucherFromAdmin({
          _id: id,
          ...values,
          code: values?.code.toLocaleUpperCase(),
          expirationDate: expirationDate
        })

        Swal.fire({
          title: "Cập nhật voucher thành công!",
          icon: "success",
        });
        next("/admin/voucher");
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: error?.response?.data?.message,
        icon: "error",
      });
    }
  };
  return (
    <div className="mx-auto w-2/3 m-6 max-w-screen-xl  px-4 py-16 sm:px-6 lg:px-8 shadow-2xl border rounded-2xl bg-gray-50">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {mode == "add" ? "Tạo" : "Cập nhật"} voucher
        </h1>
      </div>

      <div className="mx-auto mb-0 mt-8 max-w-md space-y-4">
        <Form form={form} onFinish={onFinish}>
          <div>
            <label htmlFor="vouchername" className="font-bold ">
              Mã code:
            </label>
            <Form.Item name="code">
              <Input type="vouchername" />
            </Form.Item>
          </div>

          <div>
            <label htmlFor="discount" className="font-bold ">
              Giảm giá(%):
            </label>
            <Form.Item
              name="discountPercent"
              rules={[
                { required: true, message: "Please input your discount!" },
              ]}
            >
              <Input max={100} min={0} />
            </Form.Item>
          </div>

          <div>
            <label htmlFor="discount" className="font-bold ">
              Giảm tối đa(VND):
            </label>
            <Form.Item
              name="maxDiscount"
              rules={[
                { required: true, message: "Please input your discount!" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          <div>
            <label htmlFor="discount" className="font-bold ">
              Số lượng:
            </label>
            <Form.Item
              name="maximum"
              rules={[
                { required: true, message: "Please input your discount!" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          <Form.Item
            name='expirationDate' className="mb-6">
            <label htmlFor="expirationDate" className="font-bold ">
              Thời gian:
            </label>

            <RangePicker
              value={expirationDate as any}
              minDate={dayjs()}
              defaultValue={[dayjs(), dayjs()]}
              onChange={onChange}
              inputMode="text"
              // defaultValue={[dayjs(), dayjs()]}

              showTime />
          </Form.Item>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="inline-block rounded-lg bg-blue-700 hover:bg-blue-800 px-5 py-3 text-sm font-medium text-white w-full"
            >
              {mode == "add" ? "Tạo" : "Cập nhật"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default VoucherForm;
