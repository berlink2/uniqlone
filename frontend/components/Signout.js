import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { CURRENT_USER_QUERY } from "./User";
const SIGNOUT_MUTATION = gql`
  mutation {
    signout {
      message
    }
  }
`;

const Signout = () => {
  return (
    <Mutation
      mutation={SIGNOUT_MUTATION}
      refetchQueries={[{ query: CURRENT_USER_QUERY }]}
    >
      {(signout) => {
        return <button onClick={signout}>Sign out</button>;
      }}
    </Mutation>
  );
};

export default Signout;
