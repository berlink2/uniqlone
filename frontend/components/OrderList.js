import React, { Component } from "react";
import { Query } from "react-apollo";
import { formatDistance } from "date-fns";
import Link from "next/link";
import styled from "styled-components";
import gql from "graphql-tag";
import formatMoney from "../lib/formatMoney";
import OrderItemStyles from "./styles/OrderItemStyles";
import Error from "./ErrorMessage";

// const USER_ORDERS_QUERY = gql`
//   query USER_ORDERS_QUERY {
//     orders(orderBy: createdAt_DESC) {
//       id
//       total
//       createdAt
//       item {
//         id
//         title
//         price
//         description
//         quantity
//         image
//       }
//     }
//   }
// `;

// class OrderList extends Component {
//   render() {
//     return (
//       <Query query={USER_ORDERS_QUERY}>
//         {({ data, loading, error }) => {
//           console.log(data);
//           if (loading) return <p>Loading...</p>;
//           if (error) return <Error error={error} />;
//           return <div></div>;
//         }}
//       </Query>
//     );
//   }
// }

export default OrderList;
