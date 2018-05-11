import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

const AdminRoute = ({ component: Component, isAdmin, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAdmin
        ? <Component {...props} />
        : <Redirect to="/" />
    }
  />
);

AdminRoute.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
};

export default AdminRoute;
