const { Op,Sequelize } = require('sequelize'); 

const findAndPaginate = async function (model, query, options) {

	const { page, limit, offset } = _getPagination(query);

	
	const searchConditions = query.search ? _buildSearchConditions(query.search, options) : null;
	const filtersCondition = query.filters ? buildFilterConditions(query.filters,options) : {};
    const mergedWhere = _mergeWhereConditions(options.where,searchConditions,filtersCondition)
	
    const order =  query.sortBy && query.sortDirection ? _getSorting(query,options) : [];
    const mergedOrder = _mergedOrder(options.order,order)

    const result = await model.findAndCountAll({
        ...options,
        where :mergedWhere,
        order : mergedOrder,
        limit : options.limit || limit,
        offset : options.offset || offset,
        
    })
    const count = typeof result.count == "object" ? result.count.length : result.count
    const totalPages = Math.ceil(count / limit);
    // uncomment if needed
    // if (page !== 1 && page > totalPages) throw Error('Page Not Found');

    return {
        data: result.rows.map((row, i) => ({
            sl_no: offset + 1 + i,
            ...(options.raw ? row : row.dataValues)
        })),
        meta: {
            totalRecords: count,
            totalPages,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

const _mergeWhereConditions = (...conditions) => ({[Op.and]: conditions.filter(Boolean)});
  
const _extractColumnsFromOptions = (options,filterArr=[],sequalizeColumn=false) => {
    const columns = {};
    // exclude these columns from search ,excludeSearchColumns should contain alias name if not actual name 
    const excludeSearchColumns = options.excludeSearchColumns ? options.excludeSearchColumns : []
    if (options.attributes) {
        for (const attr of options.attributes) {
            if (Array.isArray(attr)) {
                if(excludeSearchColumns.includes(attr[1]) || filterArr.length && !filterArr.includes(attr[1])) continue
                if (typeof attr[0] === 'object' && attr[0]?.col)  columns[attr[1]] = (sequalizeColumn ? Sequelize.col(`${attr[0]?.col}`) : `$${attr[0]?.col}$`);
                else columns[attr[1]] = (attr[0]);
            } 
            else {
                if(excludeSearchColumns.includes(attr) || filterArr.length && !filterArr.includes(attr)) continue
                columns[attr] = (attr);
            }
        }
    }
  
    // TODO: Handle attributes from includes


    if (filterArr.length) {
        const orderedColumns = [];
        for (const key of filterArr) {
            if (columns[key]) {
                orderedColumns.push(columns[key]);
            }
        }
        return orderedColumns;
    }
    return Object.values(columns);
};

const _getPagination = (query) => {
	const page = parseInt(query.page) || 1;
	const limit = query.limit == 'no' ? null : (parseInt(query.limit) || 10);
	const offset = (page - 1) * limit;
	return { page, limit, offset };
};


const _buildSearchConditions = (searchText, options,operator='contains',iterator) => {

    const searchColumns = (iterator !== undefined && iterator !== null) ? [options.searchColumns[iterator]] : (options.searchColumns || _extractColumnsFromOptions(options));
	const searchTerms = searchText.split('+');
  
	const orConditions = searchTerms.map(orGroup => {
        const andConditions = orGroup.trim().split('*').map(term => {
            const likeCondition = _getSequelizeCondition(operator,term);
    
            return { [Op.or]: searchColumns.map(colName => _buildSearchCondition(colName, likeCondition)) };
        });
    
        return { [Op.and]: andConditions };
        });
  
	    return { [Op.or]: orConditions };
};
const FUNCTION_WHERE_NOTWORK = ['group_concat']
const _buildSearchCondition = (colName, likeCondition) => {
    // if group_concat is used, we need to put the exact column not the group_concated one
	if (typeof colName === 'string') {
        if(FUNCTION_WHERE_NOTWORK.some(fn => colName.toLocaleLowerCase().includes(fn))) colName = _returnExactColumn(colName)

        return { [colName]: likeCondition };
    } 
    if (typeof colName == 'object' && colName.val) {
        let colValue = colName.val; // Get raw value from Sequelize.literal
        if (FUNCTION_WHERE_NOTWORK.some(fn => colValue.toLowerCase().trim().startsWith(fn))) {
            colValue = _returnExactColumn(colValue);
            return Sequelize.where(Sequelize.literal(colValue), likeCondition);
        }
    }
    return Sequelize.where( colName,likeCondition)
};
const _returnExactColumn = (expression)=> {
    // extract all text between paranthesis
    let match = expression.match(/\((.*)\)/);
    match = match ? match[1] : null;
    return match.split(",")[0]
}
const buildFilterConditions = (filters,options) => {
    // {columnName : condition:value,...}
    const colNames = _extractColumnsFromOptions(options,Object.keys(filters))
    if(!colNames.length) return null
    options.searchColumns = colNames
    return Object.keys(filters).map((col,i) => {

        if (Array.isArray(filters[col])) {
            // Handle array case
            const conditions = filters[col].map((filter) => {
                const [operator, ...valueParts] = filter.split(":");
                const value = valueParts.join(":");
                return _buildSearchConditions(value, options, operator,i);
            });
          
            return { [Sequelize.Op.and]: conditions };
          } else {
            const [operator, ...valueParts] = filters[col].split(":");
            const value = valueParts.join(":");
            return _buildSearchConditions(value, options, operator,i);
          }
    })
};
const _getSorting = (query,options) => {
    if( query.sortBy == "sl_no" ) return _getSerialNumberSorting(options,query.sortDirection)
	const sortBy =  _extractColumnsFromOptions(options,[query.sortBy],true)[0]
	const sortDirection = query.sortDirection?.toLowerCase() === 'desc' ? 'DESC' : 'ASC'; 
    if(!sortBy) return []
	return [[sortBy, sortDirection]]; 
};
const _mergedOrder = (existingConditions, newConditions=[]) => {
    existingConditions && newConditions.push(...existingConditions);
    return newConditions
};

function _getSequelizeCondition(operator = 'contains', value) {
    switch (operator) {
        case 'contains':
            return { [Op.like]: `%${value}%` };
        case 'equals':
            return value;
        case 'starts_with':
            return { [Op.like]: `${value}%` };
        case 'ends_with':
            return { [Op.like]: `%${value}` };
        case 'is_empty':
            return '';
        case 'is_not_empty':
            return {
                [Op.and]: [
                    { [Op.ne]: '' },
                    { [Op.ne]: null }
                ]
            };
        case 'greater_than':
            return { [Op.gt]: value };
        case 'greater_than_or_equal':
            return { [Op.gte]: value };
        case 'less_than':
            return { [Op.lt]: value };
        case 'less_than_or_equal':
            return { [Op.lte]: value };
        default:
            throw new Error('Invalid condition');
    }
}

const _getSerialNumberSorting = (options,direction) => {
    // check optiond order is there or not
    const sortDirection = direction.toLowerCase() == "desc" ? "desc": "asc"
    if(options.order){
        if(Array.isArray(options.order[0])) {
            const firstOrder = options.order[0]
            const lastElement = firstOrder[firstOrder.length-1]
            if (typeof lastElement === 'string' && (lastElement.toLocaleLowerCase() === 'asc' || lastElement.toLocaleLowerCase() === 'desc')) firstOrder[firstOrder.length-1] = sortDirection
              
        }
        if(typeof options.order[0] == "string") options.order.push(sortDirection)
        
        return options.order
    }
    return _getSorting({sortBy: typeof options.attributes[0] == "string" ? options.attributes[0] : options.attributes[0][1] ,sortDirection: sortDirection },options)
}
module.exports = { findAndPaginate };