// import { ObjectLiteral, Repository } from 'typeorm';
// import { PaginationQueryDto } from './dto/data-query.dto';

// export interface DataQueryOptions<T extends ObjectLiteral> {
//   repository: Repository<T>;
//   alias?: string;

//   pagination: PaginationQueryDto;

//   searchableFields?: Array<keyof T>;
//   filterableFields?: Array<keyof T>;

//   relations?: string[];

//   /**
//    * Entity fields only (TYPE SAFE)
//    */
//   select?: Array<keyof T>;

//   /**
//    * Numeric fields only
//    */
//   sumFields?: Array<keyof T>;
// }

import { ObjectLiteral, Repository } from 'typeorm';
import { PaginationQueryDto } from './dto/data-query.dto';

export interface DataQueryOptions<T extends ObjectLiteral> {
  repository: Repository<T>;
  alias?: string;

  pagination: PaginationQueryDto;

  /** 
   * Searchable fields can include nested relations like 'service.name' 
   */
  searchableFields?: string[];

  /** Fields that can be filtered (exact match) */
  filterableFields?: Array<keyof T>;

  /** Relations to join (eager loading) */
  relations?: string[];

  /** Top-level scalar fields only (TYPE SAFE) */
  select?: Array<keyof T>;

  /** Fields from relations (nested selects) */
  selectRelations?: string[];

  /** Numeric fields only, for sum/aggregate calculations */
  sumFields?: Array<keyof T>;
}

