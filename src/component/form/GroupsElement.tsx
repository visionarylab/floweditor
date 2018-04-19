import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { ResultType } from '../../flowTypes';
import { SearchResult } from '../../store';
import { getSelectClass, isValidLabel, jsonEqual } from '../../utils';
import SelectSearch from '../SelectSearch';
import FormElement, { FormElementProps } from './FormElement';
import { NewOptionCreatorHandler, IsValidNewOptionHandler } from 'react-select';

export interface GroupOption {
    group: string;
    name: string;
}

export interface GroupsElementProps extends FormElementProps {
    endpoint: string;
    add?: boolean;
    groups?: SearchResult[];
    localGroups?: SearchResult[];
    placeholder?: string;
    searchPromptText?: string | JSX.Element;
    onChange?: (groups: SearchResult[]) => void;
}

interface GroupsElementState {
    groups: SearchResult[];
    errors: string[];
}

export const isValidNewOption: IsValidNewOptionHandler = ({ label }) =>
    !label ? false : isValidLabel(label);

export const createNewOption: NewOptionCreatorHandler = ({ label }) => ({
    id: generateUUID(),
    name: label,
    extraResult: true
});

export const getInitialGroups = (
    groups: SearchResult[] = [],
    localGroups: SearchResult[] = []
): SearchResult[] => {
    if (groups.length) {
        return groups;
    } else if (localGroups.length) {
        return localGroups;
    } else {
        return [];
    }
};

export const GROUP_PROMPT = 'New group: ';
export const GROUP_PLACEHOLDER = 'Enter the name of an existing group...';
export const GROUP_NOT_FOUND = 'Invalid group name';

export default class GroupsElement extends React.Component<GroupsElementProps, GroupsElementState> {
    public static defaultProps = {
        placeholder: GROUP_PLACEHOLDER,
        searchPromptText: GROUP_NOT_FOUND
    };

    constructor(props: GroupsElementProps) {
        super(props);

        const groups = getInitialGroups(this.props.groups, this.props.localGroups);

        this.state = {
            groups,
            errors: []
        };

        this.onChange = this.onChange.bind(this);
    }

    public componentWillReceiveProps(nextProps: GroupsElementProps): void {
        if (
            nextProps.groups &&
            nextProps.groups.length &&
            !jsonEqual(nextProps.groups, this.props.groups)
        ) {
            this.setState({ groups: nextProps.groups });
        }
    }

    private onChange(groups: SearchResult[]): void {
        if (!jsonEqual(groups, this.state.groups)) {
            this.setState(
                {
                    groups
                },
                () => {
                    if (this.props.onChange) {
                        this.props.onChange(groups);
                    }
                }
            );
        }
    }

    public validate(): boolean {
        const errors: string[] = [];

        if (this.props.required && !this.state.groups.length) {
            errors.push(`${this.props.name} is required.`);
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    public render(): JSX.Element {
        const createOptions: any = {};

        if (this.props.add) {
            createOptions.isValidNewOption = isValidNewOption;
            createOptions.createNewOption = createNewOption;
            createOptions.createPrompt = GROUP_PROMPT;
        }

        const className = getSelectClass(this.state.errors.length);

        return (
            <FormElement name={this.props.name} errors={this.state.errors}>
                <SelectSearch
                    _className={className}
                    onChange={this.onChange}
                    name={this.props.name}
                    url={this.props.endpoint}
                    resultType={ResultType.group}
                    localSearchOptions={this.props.localGroups}
                    multi={true}
                    initial={this.state.groups}
                    placeholder={this.props.placeholder}
                    searchPromptText={this.props.searchPromptText}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}