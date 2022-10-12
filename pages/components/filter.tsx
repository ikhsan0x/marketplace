import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/Filter.module.less";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getCollectionFilter, getCollectionNfts } from "../api/request";
import { userConfig } from "userConfig";
import { json } from "stream/consumers";

export interface props {
  search: Function;
  data: Array<object>;
}

const Filter = (props: props) => {
  const { search, data } = props;
  const [collectionSelected, setCollectionSelected] = useState(0);
  const [orderSearch, setOrderSearch] = useState(false);
  const [orderFilterData, setOrderFilterData] = useState([]);
  const [orderSearchVal, setOrderSearchVal] = useState(0);
  const [filterSearch, setFilterSearch] = useState(false);
  const [filterSearchval, setFilterSearchval] = useState([]);
  // single tab
  const [filterVal, setFilterVal] = useState(-1);

  // all tab
  const [selectedFilter, setSelectedFilter] = useState(
    new Array(new Array(), new Array())
  );

  const [allSelectShow, setAllSelectShow] = useState(false);
  const [firstTime, setFirstTime] = useState(false);
  const [selected, setSelected] = useState([]);
  const getFilterData = async (collection: string) => {
    const data = await getCollectionFilter(collection);
    setOrderFilterData(data?.data?.data?.filter_info);
  };
  const firstLevelSearch = async (item: any, index: number) => {
    const data = await getFilterData(item?.collection);
    if (collectionSelected === index) {
      setCollectionSelected(0);
      return;
    }
    setCollectionSelected(index);
    search(item?.collection);
  };
  const closeAllSearch = () => {
    setFilterSearch(false);
    setOrderSearch(false);
    setAllSelectShow(false);
    setFilterVal(-1);
  };
  if (data.length && !firstTime) {
    setFirstTime(true);
    getFilterData(userConfig.collections[0]);
  }
  const getFilterLength = (index: number) => {
    return (
      selectedFilter?.[collectionSelected]?.[index]?.filter(
        (item: boolean) => item
      )?.length || 0
    );
  };

  const searchList = () => {
    const param: any[] = [];
    selectedFilter?.[collectionSelected].map(
      (item2: object, index2: number) => {
        if (getFilterLength(index2)) {
          const filter: any = orderFilterData[index2];
          param.push({
            filter_name: filter?.filter_name,
            filter_type: filter?.filter_type,
            filter_value: filter?.filter_value,
          });
        }
      }
    );
    search(param, "filter");
  };

  const updateSort = (array: any) => {
    const data = JSON.parse(JSON.stringify(orderFilterData));
    data.map((item: any, index: number) => {
      item.selectedCount =
        array?.[collectionSelected]?.[index]?.filter((item: boolean) => item)
          ?.length || 0;
    });
    const sortData = data.sort((a: any, b: any) => {
      if (!a.selectedCount) a.selectedCount = 0;
      if (!b.selectedCount) b.selectedCount = 0;
      return b.selectedCount - a.selectedCount;
    });

    setOrderFilterData(sortData);
    const sortArray = array[collectionSelected].sort((a: any, b: any) => {
      const length1 =
        a?.filter((item: any) => {
          return item;
        })?.length || 0;
      const length2 =
        b?.filter((item: any) => {
          return item;
        })?.length || 0;
      console.log(a, length1, "a");
      console.log(b, length2, "b");
      return length2 - length1;
    });
    array[collectionSelected] = JSON.parse(JSON.stringify(sortArray));
    console.log(sortData, "orderFilterData");
    console.log(array, "selectedFilter");
    setSelectedFilter(JSON.parse(JSON.stringify(array)));
    return sortData;
  };
  return (
    <div>
      <div className={styles.filter}>
        {data?.length > 1 && (
          <p className={styles.first_level_search}>
            {data?.length
              ? data.map((item: any, index: number) => {
                  return (
                    <span
                      key={item?.collection_name}
                      className={
                        collectionSelected === index ? styles.selected : ""
                      }
                      onClick={() => {
                        firstLevelSearch(item, index);
                      }}
                    >
                      {item?.collection_name}
                    </span>
                  );
                })
              : ""}
          </p>
        )}
        <p className={styles.secondary_search}>
          {data?.[collectionSelected]?.collection_orders?.length ? (
            <span
              className={orderSearch ? styles.selected : ""}
              onClick={() => {
                closeAllSearch();
                setOrderSearch(!orderSearch);
              }}
            >
              {
                data?.[collectionSelected]?.collection_orders?.[orderSearchVal]
                  ?.order_desc
              }
              <img
                src={
                  !orderSearch
                    ? "/images/icon/arrorw/icon_arrow_down_black.svg"
                    : "/images/icon/arrorw/icon_arrow_up.svg"
                }
                alt=""
              />
            </span>
          ) : (
            ""
          )}
          {orderFilterData?.length ? (
            <span
              className={filterSearch ? styles.selected : ""}
              onClick={() => {
                closeAllSearch();
                setFilterSearch(!filterSearch);
              }}
            >
              Filter
              <img
                src={
                  !filterSearch
                    ? "/images/icon/arrorw/icon_arrow_down_black.svg"
                    : "/images/icon/arrorw/icon_arrow_up.svg"
                }
                alt=""
              />
            </span>
          ) : (
            ""
          )}
          {orderSearch &&
            data?.[collectionSelected]?.collection_orders?.length && (
              <div
                className={styles.secondary_search_modal}
                style={{
                  marginTop: "9px",
                }}
              >
                {data?.[collectionSelected]?.collection_orders.map(
                  (item: any, index: number) => {
                    return (
                      <p
                        key={item?.order_field}
                        className={`${styles.secondary_search_modal_item} ${
                          orderSearchVal === index
                            ? styles.secondary_search_modal_item_selected
                            : ""
                        }`}
                        onClick={() => {
                          search(
                            {
                              order_by: item?.order_field,
                              desc: item?.desc,
                            },
                            "order"
                          );
                          setOrderSearchVal(index);
                          setOrderSearch(false);
                        }}
                      >
                        {item?.order_desc}
                        {orderSearchVal === index && (
                          <img src="/icon_choose.svg" alt="" />
                        )}
                      </p>
                    );
                  }
                )}
              </div>
            )}
          {filterVal !== -1 &&
            orderFilterData?.[filterVal]?.filter_value?.length && (
              <div
                className={styles.secondary_search_modal}
                style={{
                  borderRadius: "0px",
                  padding: "10px 0px 0px",
                }}
              >
                {/* filter四级导航 */}
                {orderFilterData?.[filterVal]?.filter_value?.map(
                  (item: string, index: number) => {
                    return (
                      <p
                        key={item}
                        className={`${styles.secondary_search_modal_item} ${
                          filterSearchval[index]
                            ? styles.tertiary_search_modal_item_selected
                            : ""
                        }`}
                        onClick={() => {
                          let array: any = [...filterSearchval];
                          array[index] = !array[index];
                          setFilterSearchval(array);
                        }}
                      >
                        {item}
                        {filterSearchval[index] && (
                          <img src="/icon_choose.svg" alt="" />
                        )}
                      </p>
                    );
                  }
                )}
                <p className={`${styles.secondary_search_modal_bottons}`}>
                  <span
                    onClick={() => {
                      setFilterSearchval([]);
                    }}
                  >
                    Clear All
                  </span>
                  <span
                    onClick={() => {
                      const array: any = [...selectedFilter];
                      array[collectionSelected][filterVal] = filterSearchval;
                      const data = updateSort(array);
                      array[collectionSelected].sort((a: number, b: number) => {
                        // let length1 = a?.length || 0;
                        // let length2 = b?.length || 0;
                        // return length2 - length1;
                        const length1 =
                          a?.filter((item: any) => {
                            return item;
                          })?.length || 0;
                        const length2 =
                          b?.filter((item: any) => {
                            return item;
                          })?.length || 0;
                        console.log(a, length1, "a");
                        console.log(b, length2, "b");
                        return length2 - length1;
                      });
                      setSelectedFilter(array);
                      let param: any[] = [];
                      array[collectionSelected].map(
                        (item: any, index: number) => {
                          if (item?.length) {
                            const filter = data?.[index];
                            const filter_value = filter?.filter_value?.filter(
                              (item2: string, index2: number) => {
                                if (array[collectionSelected][index][index2]) {
                                  return item2;
                                }
                              }
                            );
                            filter_value?.length &&
                              param.push({
                                filter_name: filter?.filter_name,
                                filter_type: filter?.filter_type,
                                filter_value: filter_value,
                              });
                          }
                        }
                      );
                      search(param, "filter");
                      setFilterVal(-1);
                    }}
                  >
                    Apply
                  </span>
                </p>
              </div>
            )}
          {allSelectShow && orderFilterData?.length && (
            <div
              className={styles.secondary_search_modal}
              style={{
                borderRadius: "0px",
                padding: "10px 0px 0px",
                marginTop: "10px",
              }}
            >
              {/* filter四级导航 */}
              {orderFilterData?.map((item: any, index: number) => {
                return (
                  <p
                    key={index}
                    className={`${styles.secondary_search_modal_item} ${
                      getFilterLength(index)
                        ? styles.tertiary_search_modal_item_selected
                        : ""
                    }`}
                    onClick={(e) => {
                      const array = [...selectedFilter];
                      const length =
                        orderFilterData[index]?.filter_value?.length;
                      if (getFilterLength(index) < length) {
                        array[collectionSelected][index] = new Array(
                          length
                        ).fill(true);
                      } else {
                        array[collectionSelected][index] = [];
                      }
                      updateSort(array);
                      array[collectionSelected].sort((a: [], b: []) => {
                        // let length1 = a?.length || 0;
                        // let length2 = b?.length || 0;
                        const length1 =
                          a?.filter((item: any) => {
                            return item;
                          })?.length || 0;
                        const length2 =
                          b?.filter((item: any) => {
                            return item;
                          })?.length || 0;
                        return length2 - length1;
                        // return length2 - length1;
                      });
                      console.log(array);
                      setSelectedFilter(JSON.parse(JSON.stringify(array)));
                      searchList();
                    }}
                  >
                    {item?.filter_name}({item?.filter_value?.length || 0})
                    {getFilterLength(index) ? (
                      <img src="/icon_choose.svg" alt="" />
                    ) : (
                      ""
                    )}
                  </p>
                );
              })}
            </div>
          )}
        </p>
        {/* filter三级导航 */}
        {filterSearch && orderFilterData?.length && (
          <p
            className={styles.tertiary_search}
            style={{
              marginTop: allSelectShow ? "-36px" : "0px",
            }}
          >
            <p className={styles.tertiary_container}>
              {!allSelectShow &&
                orderFilterData?.map((item: any, index: number) => {
                  return (
                    <span
                      key={item?.filter_name}
                      className={filterVal === index ? styles.selected : ""}
                      onClick={() => {
                        if (filterVal === index) {
                          setFilterVal(-1);
                          return;
                        }
                        if (selectedFilter?.[collectionSelected]?.[index]) {
                          setFilterSearchval(
                            JSON.parse(
                              JSON.stringify(
                                selectedFilter?.[collectionSelected]?.[index]
                              )
                            )
                          );
                        } else {
                          setFilterSearchval([]);
                        }
                        setFilterVal(index);
                      }}
                    >
                      {item?.filter_name}
                      {item?.selectedCount ? `(${item?.selectedCount})` : ""}
                      <img
                        src={
                          filterVal !== index
                            ? "/images/icon/arrorw/icon_arrow_down_black.svg"
                            : "/images/icon/arrorw/icon_arrow_up.svg"
                        }
                        alt=""
                      />
                    </span>
                  );
                })}
              <span
                className={styles.all_select}
                onClick={() => {
                  if (
                    orderSearch ||
                    filterVal !== -1 ||
                    !orderFilterData?.length
                  ) {
                    return;
                  }
                  setOrderSearch(false);
                  setAllSelectShow(false);
                  setFilterVal(-1);
                  setAllSelectShow(!allSelectShow);
                }}
              >
                <img
                  src="/images/more.svg"
                  alt=""
                  style={{
                    opacity:
                      orderSearch || filterVal !== -1 || allSelectShow
                        ? 0.3
                        : 1,
                  }}
                />
              </span>
            </p>
          </p>
        )}
      </div>
      {(orderSearch || filterVal !== -1 || allSelectShow) && (
        <div
          onClick={() => {
            if (allSelectShow) {
              const array: any = [...selectedFilter];
              array[collectionSelected][filterVal] = filterSearchval;
            }
            setOrderSearch(false);
            setAllSelectShow(false);
            setFilterVal(-1);
          }}
          className={styles.filter_modal}
        ></div>
      )}
    </div>
  );
};

export default Filter;