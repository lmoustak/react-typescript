import { useState, useEffect } from "react";
import axios from "axios";

export interface AnyObject {
  [key: string]: any
}

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
export interface JoinParams {
  select: string,
  as: string,
  from: string,
  join: string,
  on: string,
  path?: string,
  param?: string  // TODO Implement at a later stage...
}

/**
 * An interface containing parameters for fetching, and - optionally - transforming data
 *
 * @param {string} url The URL to fetch the data from
 * @param {JoinParams} [joins] Optional, may be a single object or an array of objects.
 * Contains transformation parameters
 */
export interface SearchParams {
  url: string,
  joins?: JoinParams | JoinParams[]
}

/**
 * A Hook designed to fetch data from a URL, and optionally transform it by joining it with other data queries.
 *
 * @param {(string|SearchParams)} query A string containing the query URL to fetch data from, or a SearchParams object
 *
 * @retuns The [data, loading] tuple
 */
const useSearch = (query: string | SearchParams = ""):
  [AnyObject[], React.Dispatch<React.SetStateAction<AnyObject[]>>, boolean] => {
  const [data, setData] = useState<AnyObject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query == null) return;
    let url = typeof query === "string" ? query : query.url;

    const search = async () => {
      try {
        let { data: _searchData } = await axios.get(url);
        let searchData = Array.isArray(_searchData) ? _searchData : [_searchData];

        if (typeof query !== "string" && query.joins != null) {
          let joins = Array.isArray(query.joins)
            ? query.joins
            : [query.joins];

          await Promise.all(joins.map(async joinClause => {
            let {
              select: selectField,  // the result object's key to return
              as: newField,         // the new key to be added to the given data
              from: fromUrl,        // the URL to query for the JOIN
              join: matchField,     // the result key whose value matches...
              on: originalField,    // the given key's value
              path,
              param
            } = joinClause;


            if (fromUrl.lastIndexOf("/") === fromUrl.length - 1) {
              fromUrl = fromUrl.substring(0, fromUrl.length - 1);
            }

            let distinctValues = searchData
              .map((item: any) => item[originalField])
              .filter((value, index, self) => value != null && self.indexOf(value) === index);

            let results: any[] = [];

            await Promise.all(distinctValues.map(async value => {
              try {
                let queryUrl: string;
                if (path && fromUrl.includes(`:${path}`)) {
                  queryUrl = fromUrl.replace(`:${path}`, value);
                } else if (param) {
                  queryUrl = `${fromUrl}?${param}=${value}`;
                } else {
                  queryUrl = `${fromUrl}/${value}`;
                }

                let { data: result } = await axios.get(queryUrl);
                if (Array.isArray(result)) {
                  [result] = result;
                }
                results = [...results, result];
              } catch (err) {
                console.error(err?.response?.status ?? err);
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
        console.error(err?.response?.status ?? err);
        setData([]);
      } finally {
        setLoading(false);
      }

    };

    if (url) {
      setLoading(true);
      search();
    }

  }, [query]);

  return [data, setData, loading];
};

export { useSearch };