import React from 'react';
import { ProjectForm } from '../../CreateProject/components/ProjectForm';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

let formComponent;

beforeEach(() => {
  formComponent = shallow(<ProjectForm />);
});

describe('Project form', () => {

  it('should match its empty snapshot', () => {
    const tree = renderer.create(
      <ProjectForm />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('has all fields', () => {
    expect(formComponent.find('.form-container').length).toBe(1);
    expect(formComponent.find('.form-control').length).toBe(11);
    expect(formComponent.find('#name').length).toBe(1);
    expect(formComponent.find('#description').length).toBe(1);
    expect(formComponent.find('#organization').length).toBe(1);
    expect(formComponent.find('#invoiceAddress').length).toBe(1);
    expect(formComponent.find('#customerName').length).toBe(1);
    expect(formComponent.find('#customerEmail').length).toBe(1);
    expect(formComponent.find('#customerPhone').length).toBe(1);
    expect(formComponent.find('#customerReference').length).toBe(1);
    expect(formComponent.find('#internalReference').length).toBe(1);
    expect(formComponent.find('#sampleLocation').length).toBe(1);
    expect(formComponent.find('#info').length).toBe(1);
    expect(formComponent.find('#submit-project').length).toBe(1);
  });

  it('fields are empty', () => {
    expect(formComponent.find('#name').props().value).toEqual('');
    expect(formComponent.find('#description').props().value).toEqual('');
  });

  it('name field can be changed', () => {
    formComponent.find('#name').simulate('change', { target: { name: 'name', value: 'Test name' } });
    expect(formComponent.state('name')).toEqual('Test name');
  });

  it('can be submitted', () => {
    formComponent.find('#form-object').simulate('submit', { preventDefault: jest.fn() });
  })

});
