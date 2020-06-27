import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import Error from "./ErrorMessage";
import Table from "./styles/Table";
import SickButton from "./styles/SickButton";
import PropTypes from "prop-types";
const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const possiblePermissions = [
  "ADMIN",
  "USER",
  "ITEMCREATE",
  "ITEMUPDATE",
  "ITEMDELETE",
  "PERMISSIONUPDATE",
];

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation updatePermissions($permissions: [Permission], $userId: ID!) {
    updatePermissions(permissions: $permissions, userId: $userId) {
      id
      permissions
      name
      email
    }
  }
`;
const Permissions = (props) => {
  return (
    <Query query={ALL_USERS_QUERY}>
      {({ data, loading, error }) => (
        <div>
          <Error error={error} />
          <div>
            <h2>Manage Permissions</h2>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {possiblePermissions.map((elem, i) => {
                    return <th key={i}>{elem}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {data.users.map((user, i) => {
                  return <User key={i} user={user} />;
                })}
              </tbody>
            </Table>
          </div>
        </div>
      )}
    </Query>
  );
};

class User extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired,
  };

  state = {
    permissions: this.props.user.permissions,
  };

  handlePermissionChange = (e, updatePermissions) => {
    const checkbox = e.target;
    let updatedPermissions = [...this.state.permissions];
    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value);
    } else {
      updatedPermissions = updatedPermissions.filter((permission) => {
        return permission !== checkbox.value;
      });
    }
    this.setState({ permissions: updatedPermissions }, updatePermissions);
  };
  render() {
    const user = this.props.user;
    return (
      <Mutation
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{
          permissions: this.state.permissions,
          userId: this.props.user.id,
        }}
      >
        {(updatedPermissions, { loading, error }) => {
          return (
            <>
              <Error error={error} />
              <tr>
                <td>{user.name}</td>
                <td>{user.email}</td>
                {possiblePermissions.map((permission, i) => {
                  return (
                    <td key={i}>
                      <label htmlFor={`${user.id}-permission-${permission}`}>
                        <input
                          id={`${user.id}-permission-${permission}`}
                          type="checkbox"
                          checked={this.state.permissions.includes(permission)}
                          value={permission}
                          onChange={(e) =>
                            this.handlePermissionChange(e, updatedPermissions)
                          }
                        />
                      </label>
                    </td>
                  );
                })}
                <td>
                  <SickButton
                    type="button"
                    disabled={loading}
                    onClick={updatedPermissions}
                  >
                    Updat{loading ? "ing" : "e"}
                  </SickButton>
                </td>
              </tr>
            </>
          );
        }}
      </Mutation>
    );
  }
}

export default Permissions;
