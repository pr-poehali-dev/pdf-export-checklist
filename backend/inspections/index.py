import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для управления актами осмотра квартир'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    schema = 't_p27133687_pdf_export_checklist'
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        if method == 'GET':
            inspection_id = event.get('queryStringParameters', {}).get('id')
            
            if inspection_id:
                cur.execute(f"""
                    SELECT id, address, inspection_date, inspector_signature, 
                           client_signature, checklist_data, created_at
                    FROM {schema}.inspections 
                    WHERE id = {inspection_id}
                """)
                row = cur.fetchone()
                
                if row:
                    result = {
                        'id': row[0],
                        'address': row[1],
                        'inspectionDate': row[2].isoformat(),
                        'inspectorSignature': row[3],
                        'clientSignature': row[4],
                        'checklist': row[5],
                        'createdAt': row[6].isoformat()
                    }
                else:
                    result = None
            else:
                cur.execute(f"""
                    SELECT id, address, inspection_date, created_at
                    FROM {schema}.inspections 
                    ORDER BY created_at DESC
                """)
                rows = cur.fetchall()
                result = [{
                    'id': row[0],
                    'address': row[1],
                    'inspectionDate': row[2].isoformat(),
                    'createdAt': row[3].isoformat()
                } for row in rows]
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            data = json.loads(event.get('body', '{}'))
            
            cur.execute(f"""
                INSERT INTO {schema}.inspections 
                (address, inspection_date, inspector_signature, client_signature, checklist_data)
                VALUES ('{data['address']}', '{data['inspectionDate']}', 
                        '{data.get('inspectorSignature', '')}', '{data.get('clientSignature', '')}', 
                        '{json.dumps(data['checklist'])}')
                RETURNING id
            """)
            inspection_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': inspection_id, 'message': 'Акт сохранен'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            data = json.loads(event.get('body', '{}'))
            inspection_id = data.get('id')
            
            cur.execute(f"""
                UPDATE {schema}.inspections 
                SET address = '{data['address']}',
                    inspection_date = '{data['inspectionDate']}',
                    inspector_signature = '{data.get('inspectorSignature', '')}',
                    client_signature = '{data.get('clientSignature', '')}',
                    checklist_data = '{json.dumps(data['checklist'])}',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = {inspection_id}
            """)
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Акт обновлен'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            inspection_id = event.get('queryStringParameters', {}).get('id')
            
            cur.execute(f"""
                DELETE FROM {schema}.inspections WHERE id = {inspection_id}
            """)
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Акт удален'}),
                'isBase64Encoded': False
            }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
