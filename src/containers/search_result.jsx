import _ from 'lodash';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Table, TableHeader, TableBody, TableRow,
} from 'material-ui';
import {
  NavigationArrowDropDown, NavigationArrowDropUp,
} from 'material-ui/svg-icons';
import Pagination from 'react-ultimate-pagination-material-ui';
import styled from 'styled-components';

import SearchSettings from './search_settings';
import { SEARCH_RESULTS_COLUMN, SORT_BY_METHOD } from '../constants';
import { muiTheme, tableStyles } from '../constants/styles';
import { TableHeaderColumn, TableRowColumn } from '../components/misc';
import * as searchActions from '../actions/search';


const flexOptions = {
  [SEARCH_RESULTS_COLUMN.TITLE]: 6,
  [SEARCH_RESULTS_COLUMN.AUTHORS]: 3,
  [SEARCH_RESULTS_COLUMN.YEAR]: 2,
  [SEARCH_RESULTS_COLUMN.RATING]: 2,
  [SEARCH_RESULTS_COLUMN.DESIGN]: 3,
  [SEARCH_RESULTS_COLUMN.METHOD]: 3,
  [SEARCH_RESULTS_COLUMN.METHODOLOGY]: 3,
};

class SearchResult extends Component {
  constructor(props) {
    super(props);
    this.onPaginationChange = this.onPaginationChange.bind(this);
    this.onChangeSortBy = this.onChangeSortBy.bind(this);
  }

  onPaginationChange(page) {
    this.props.actions.fetchArticles({
      ...this.props.search.query,
      page,
    });
  }

  onChangeSortBy(key) {
    this.props.actions.sortSearchResultsBy(key, this.props.search.query);
  }

  renderItems() {
    const { search: { results, visibility } } = this.props;

    return results.items.map((item) => {
      return (
        <TableRow key={item.id} style={tableStyles.bodyRow}>
          {_.values(SEARCH_RESULTS_COLUMN).map(key => (
            TableRowColumn({
              key,
              value: item[key],
              flex: flexOptions[key],
              visibility: visibility[key],
              forceShow: key === SEARCH_RESULTS_COLUMN.TITLE,
              justifyContent: [
                SEARCH_RESULTS_COLUMN.YEAR, SEARCH_RESULTS_COLUMN.RATING,
              ].includes(key) && 'center',
            })
          ))}
        </TableRow>
      );
    });
  }

  renderSearchResults() {
    const { search: { visibility, query: { sortBy } } } = this.props;
    const { palette } = muiTheme;

    const Label = styled.div`
      display: flex;
      align-items: center;
      cursor: pointer;
      color: ${props => props.highlight && palette.accent1Color || palette.accent3Color}
    `;
    const Operations = styled.div`
      display: flex;
      flex-direction: column;
    `;
    const ArrowDropUp = styled(NavigationArrowDropUp)`
      color: ${palette.accent3Color} !important;
      margin-bottom: -8px;
    `;
    const HighlightArrowDropUp = ArrowDropUp.extend`
      color: ${palette.accent1Color} !important;
    `;
    const ArrowDropDown = styled(NavigationArrowDropDown)`
      color: ${palette.accent3Color} !important;
      margin-top: -8px;
    `;
    const HighlightArrowDropDown = ArrowDropDown.extend`
      color: ${palette.accent1Color} !important;
    `;

    const CustomizedHeaderColumn = ({ key, label, ...rest }) => {
      const shouldHighlight = sortBy.key === key;

      return TableHeaderColumn({
        flex: flexOptions[key],
        visibility: visibility[key],
        value: (
          <Label
            onClick={() => this.onChangeSortBy(key)}
            highlight={shouldHighlight}
          >
            {label}
            <Operations>
              {shouldHighlight && sortBy.order === SORT_BY_METHOD.ASC ?
                <HighlightArrowDropUp /> : <ArrowDropUp />
              }
              {shouldHighlight && sortBy.order === SORT_BY_METHOD.DESC ?
                <HighlightArrowDropDown /> : <ArrowDropDown />
              }
            </Operations>
          </Label>
        ),
        ...rest,
      });
    };

    return (
      <Table selectable={false} style={tableStyles.table}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow style={tableStyles.headerRow}>
            {CustomizedHeaderColumn({
              key: SEARCH_RESULTS_COLUMN.TITLE,
              label: 'Title',
              forceShow: true,
            })}
            {CustomizedHeaderColumn({
              key: SEARCH_RESULTS_COLUMN.AUTHORS,
              label: 'Authors',
            })}
            {CustomizedHeaderColumn({
              key: SEARCH_RESULTS_COLUMN.YEAR,
              label: 'Publish Year',
              justifyContent: 'center',
            })}
            {CustomizedHeaderColumn({
              key: SEARCH_RESULTS_COLUMN.RATING,
              label: 'Credibility Rating (0-5)',
              justifyContent: 'center',
            })}
            {CustomizedHeaderColumn({
              key: SEARCH_RESULTS_COLUMN.DESIGN,
              label: 'Research Design',
            })}
            {CustomizedHeaderColumn({
              key: SEARCH_RESULTS_COLUMN.METHOD,
              label: 'SE Method',
            })}
            {CustomizedHeaderColumn({
              key: SEARCH_RESULTS_COLUMN.METHODOLOGY,
              label: 'SE Methodology',
            })}
          </TableRow>
        </TableHeader>

        <TableBody
          displayRowCheckbox={false}
          showRowHover
        >
          {this.renderItems()}
        </TableBody>
      </Table>
    );
  }

  renderPagination() {
    const { search: { query, results: { total } } } = this.props;
    const Div = styled.div`
      margin-top: 25px;
    `;

    return (total &&
      <Div>
        <Pagination
          currentPage={query.page}
          totalPages={Math.ceil(total / query.limit)}
          onChange={this.onPaginationChange}
        />
      </Div>
    );
  }

  render() {
    return (
      <div>
        <SearchSettings />
        {this.renderSearchResults()}
        {this.renderPagination()}
      </div>
    );
  }
}

const mapStateToProps = ({ search }) => {
  return { search };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(searchActions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchResult);
