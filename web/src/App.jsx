import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Header from './common/components/Header';
import ProjectList from './ProjectList/components/ProjectList';
import Project from './Project/components/Project';
import CreateProject from './Project/components/CreateProject';
import AdminView from './AdminView/components/AdminView';
import NotFound from './common/components/NotFound';
import '../dist/fonts/fonts.css';
import './common/css/main.scss';

class App extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <div className="content-container">
          <Switch>
            <Route exact path="/" component={ProjectList} />
            <Route path="/projects/new" component={CreateProject} />
            <Route exact path="/projects" component={ProjectList} />
            <Route path="/projects/:id" component={Project} />
            <Route exact path="/admin" component={AdminView} />
            <Route exact path="*" component={NotFound} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
