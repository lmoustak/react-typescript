import { useState, useEffect } from "react";
import axios from "axios";

export interface TransformationObject {
  transformationUrl: string,
  fromField: string,
  toField: string,
  queryResultField: string,
  transformationQueryParams?: Array<string>
};

export interface DataParams {
  queryUrl: string,
  transformations?: TransformationObject | Array<TransformationObject>
};

const useSearch = (props: string | DataParams): [Array<any>, boolean] => {
  const [data, setData] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let queryUrl = typeof props === "string" ? props : props.queryUrl;

    const search = async () => {
      let { data: _searchData }: { data: Array<any> | any } = await axios.get(queryUrl);
      let searchData = Array.isArray(_searchData) ? _searchData : [_searchData];

      if (typeof props !== "string" && props.transformations != null) {
        let transformations = Array.isArray(props.transformations) ? props.transformations : [props.transformations];

        await Promise.all(transformations.map(async transformation => {
          let {transformationUrl, fromField, toField, queryResultField} = transformation;
          if (transformationUrl.lastIndexOf("/") !== transformationUrl.length - 1) {
            transformationUrl += "/";
          }
          let distinctValues = searchData.map((item: any) => item[fromField]).filter((item, index, self) => self.indexOf(item) === index);
          let transformationQueryResults: Array<any> = [];
          console.log(distinctValues)

          await Promise.all(distinctValues.map(async value => {
            let {data: result} = await axios.get(transformationUrl + value);
            console.log(result);

            transformationQueryResults.push(result);
          }));
          console.log(transformationQueryResults[0][queryResultField])

          searchData.forEach(item => item[toField] = transformationQueryResults.find(result => item[fromField] === result[queryResultField]));
          console.log(searchData[0]);
        }));
      }
      console.log(searchData)
      setData(searchData);
      setLoading(false);
    };

    if (queryUrl) {
      search();
    } else {
      setLoading(false);
    }

  }, [props]);

  return [data, loading];
};

export {useSearch};