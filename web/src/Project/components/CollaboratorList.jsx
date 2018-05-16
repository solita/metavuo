import React from 'react';
import PropTypes from 'prop-types';
import CollaboratorListAdd from './CollaboratorListAdd';

const CollaboratorList = props => (
  <div>
    <h2>Collaborators</h2>
    <CollaboratorListAdd {...props} />
  </div>
);

CollaboratorList.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default CollaboratorList;
