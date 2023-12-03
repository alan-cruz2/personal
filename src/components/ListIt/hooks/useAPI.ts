import { useCallback, useEffect, useState } from "react";

export const useGetAPI = (user: any) => {
  const [data, setData] = useState();
  const [shouldFetch, setShouldFetch] = useState(true);

  useEffect(() => {
    if (shouldFetch) {
      fetch(
        "https://zu5haugmkr2ft3oq4i3li2abcy0ktqvt.lambda-url.us-east-1.on.aws/",
        {
          method: "POST",
          body: user,
        }
      )
        .then((response) => response.json())
        .then((data) => {
          setShouldFetch(false);
          setData(data?.Items ?? []);
        })
        .catch((error) => console.log("**** data response error", error));
    }
  }, [shouldFetch, user]);

  const refresh = useCallback(() => {
    setShouldFetch(true);
  }, [setShouldFetch]);

  return {
    data,
    refresh,
  };
};

export const usePutAPI = () => {
  const postRequest = async (body: any) => {
    const response = await fetch(
      "https://zu5haugmkr2ft3oq4i3li2abcy0ktqvt.lambda-url.us-east-1.on.aws/",
      {
        method: "PUT",
        body,
      }
    );

    console.log("**** POST response", response);
    return response;
  };

  return { postRequest };
};
