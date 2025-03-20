import 'reflect-metadata';
import { DataSource } from 'typeorm';
export declare const dataSource: DataSource;
export default dataSource;
export declare const initializeDatabase: () => Promise<DataSource>;
