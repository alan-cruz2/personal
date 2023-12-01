import { useEffect, useState } from "react";

export const useGetAPI = (user) => {
  const [data, setData] = useState();
  
  useEffect(() => {
    fetch("https://zu5haugmkr2ft3oq4i3li2abcy0ktqvt.lambda-url.us-east-1.on.aws/", {
      method: "POST",
      body: user
    })
      .then(response => response.json())
      .then(data => setData(data?.Items ?? []))
      .catch(error => console.log("**** data response error", error))
  }, []);

  return {
    data
  };
};

export const usePutAPI = () => {
  const postRequest = async (body) => {
    const response = await fetch("https://zu5haugmkr2ft3oq4i3li2abcy0ktqvt.lambda-url.us-east-1.on.aws/", {
      method: "PUT",
      body
    });

    console.log("**** POST response", response);
    return response;
  }

  return { postRequest };
};