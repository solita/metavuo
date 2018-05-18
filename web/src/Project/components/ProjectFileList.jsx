import React from 'react';
import { IconButton, List, ListItem, ListItemSecondaryAction } from 'material-ui';

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
      <div style={{ marginTop: 12 }}>
        <List>
          {this.props.files.map(file => (
            <ListItem button key={file.id}>
              <a
                href={`/api/projects/${this.props.url}/files/${file.fileName}`}
              > Name: {file.fileName}, Size: {getFileSize(file.fileSize)},
            Created: {new Date(Date.parse(file.created)).toLocaleDateString()}
              </a>
              <ListItemSecondaryAction>
                <a href={`/api/projects/${this.props.url}/files/${file.fileName}`} >
                  <IconButton aria-label="Download">
                    <i className="material-icons">file_download</i>
                  </IconButton>
                </a>
                <IconButton onClick={() => this.deleteStorageFileClick(file.fileName)} aria-label="Delete">
                  <i className="material-icons">delete</i>
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </div>
    );
  }
}
export default ProjectFileList;
