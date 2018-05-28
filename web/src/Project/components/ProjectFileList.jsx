import React from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';

const getFileSize = (number) => {
  if (number < 1024) {
    return `${number} bytes`;
  } else if (number >= 1024 && number < 1048576) {
    return `${(number / 1024).toFixed(1)} KB`;
  } else if (number >= 1048576) {
    return `${(number / 1048576).toFixed(1)} MB`;
  }
  return 'Invalid file size';
};

class ProjectFileList extends React.Component {
  constructor(props) {
    super(props);
    this.deleteStorageFileClick = this.deleteStorageFileClick.bind(this);
  }

  deleteStorageFileClick(fileName) {
    this.props.deleteStorageFileClick(fileName);
  }

  render() {
    return (
      <div>
        {this.props.files.map(file => (
          <div key={file.id} className="divider-section">
            <div className="sub-divider-section flex-row">
              <div className="right-divider button-container">
                <p className="bold-text">File name:</p>
              </div>
              <div className="left-divider">
                <div className="status-row">
                  <p className="bold-text">{file.fileName}</p>
                  <div>
                    <a
                      href={`/api/projects/${this.props.url}/files/${file.fileName}`}
                      className="button-link"
                    >
                      <Tooltip title="Download" placement="bottom">
                        <Button
                          variant="fab"
                          className="white-button round-button"
                          aria-label="Download"
                        >
                          <i className="material-icons">file_download</i>
                        </Button>
                      </Tooltip>
                    </a>
                    <Tooltip title="Delete" placement="bottom">
                      <Button
                        variant="fab"
                        className="white-button round-button"
                        onClick={() => this.deleteStorageFileClick(file.fileName)}
                        aria-label="Delete"
                      >
                        <i className="material-icons">delete_outline</i>
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            <div className="divider-section flex-row">
              <div className="right-divider">
                <p className="bold-text">Size:</p>
                <p className="bold-text">Added:</p>
                <p className="bold-text">Added by:</p>
                <p className="bold-text">Description:</p>
              </div>
              <div className="left-divider">
                <div>
                  <p>{getFileSize(file.fileSize)}</p>
                  <p>{new Date(Date.parse(file.created)).toLocaleDateString()}</p>
                  <p>{file.createdBy}</p>
                  {file.description && <p className="description-color">{file.description}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
export default ProjectFileList;
ProjectFileList.propTypes = {
  files: PropTypes.arrayOf(PropTypes.instanceOf(File)),
  deleteStorageFileClick: PropTypes.func,
  url: PropTypes.string,
};

ProjectFileList.defaultProps = {
  files: [],
  deleteStorageFileClick: () => null,
  url: '',
};
