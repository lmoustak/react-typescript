import { useState, useEffect } from "react";
import axios from "axios";

/**
 * An interface to transform given data, akin to JOINing tables in SQL.
 *
 * This will replace the values of one column of our given data, with the values of a result query.
 *
 * All required params have been written to resemble SQL keywords for a JOIN clause.
 *
 * @param {string} select The value to retrieve from the result objects
 * @param {string} as The name of the new field in the given data to store the values in
 * @param {string} from The URL to query for the transformation
 * @param {string} join The field of the result objects to test for equality...
 * @param {string} on with the field of the given data
 */
export interface TransformationParams {
  select: string,
  as: string,
  from: string,
  join: string,
  on: string,
  params?: Array<string>  // TODO Implement at a later stage...
};

/**
 * An interface containing parameters for fetching, and - optionally - transforming data
 *
 * @param {string} queryUrl The URL to fetch the data from
 * @param {TransformationParams} [transformations] Optional, may be a single object or an array of objects.
 * Contains transformation parameters
 */
export interface SearchParams {
  queryUrl: string,
  transformations?: TransformationParams | Array<TransformationParams>
};

/**
 * A Hook designed to fetch data from a URL, and optionally transform it by joining it with other data queries.
 *
 * @param {(string|SearchParams)} props A string containing the query URL to fetch data from, or a SearchParams object
 *
 * @retuns The [data, loading] tuple
 */
const useSearch = (props: string | SearchParams = ""): [Array<any>, boolean] => {
  const [data, setData] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let queryUrl = typeof props === "string" ? props : props.queryUrl;

    const search = async () => {
      try {
        let { data: _searchData } = await axios.get(queryUrl);
        let searchData = Array.isArray(_searchData) ? _searchData : [_searchData];

        if (typeof props !== "string" && props.transformations != null) {
          let transformations = Array.isArray(props.transformations)
            ? props.transformations
            : [props.transformations];

          await Promise.all(transformations.map(async transformation => {
            let {
              select: selectField,  // the result object's key to return
              from: fromUrl,        // the URL to query for the JOIN
              as: newField,         // the new key to be added to the given data
              join: matchField,     // the result key whose value matches...
              on: originalField     // the given key's value
            } = transformation;

            if (fromUrl.lastIndexOf("/") !== fromUrl.length - 1) {
              fromUrl += "/";
            }

            let distinctValues = searchData
              .map((item: any) => item[originalField])
              .filter((value, index, self) => value != null && self.indexOf(value) === index);

            let results: Array<any> = [];

            await Promise.all(distinctValues.map(async value => {
              try {
                let { data: result } = await axios.get(fromUrl + value)
                results.push(result);
              } catch (err) {
                console.error(err.response.status);
              }
            }));

            if (results.length) {
              searchData.forEach(item =>
                item[newField] = results.find(result =>
                  item[originalField] === result[matchField]
                )[selectField]
              );
            }
          }));
        }

        setData(searchData);

      } catch (err) {
        console.error(err.response.status);
      } finally {
        setLoading(false);
      }

    };

    if (queryUrl) {
      setLoading(true);
      search();
    }

  }, [props]);

  return [data, loading];
};

export { useSearch };