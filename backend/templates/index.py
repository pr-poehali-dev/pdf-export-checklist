import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для получения шаблонов типовых замечаний'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    schema = 't_p27133687_pdf_export_checklist'
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        category = event.get('queryStringParameters', {}).get('category')
        
        if category:
            cur.execute(f"""
                SELECT id, category, template_text
                FROM {schema}.comment_templates 
                WHERE category = '{category}'
                ORDER BY template_text
            """)
        else:
            cur.execute(f"""
                SELECT id, category, template_text
                FROM {schema}.comment_templates 
                ORDER BY category, template_text
            """)
        
        rows = cur.fetchall()
        result = [{
            'id': row[0],
            'category': row[1],
            'text': row[2]
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
