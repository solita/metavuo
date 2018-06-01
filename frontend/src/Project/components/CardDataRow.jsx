import React from 'react';
import PropTypes from 'prop-types';

const CardDataRow = props => (
  <div className="flex-row">
    <div className="left-divider"><p className="bold-text">{props.name}:</p></div>
    <div className="right-divider"><p>{props.content}</p></div>
  </div>
);

CardDataRow.propTypes = {
  name: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

export default CardDataRow;
