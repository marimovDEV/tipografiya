"""
Phase 5: Financial Module API Views
Accounting, KPI, profitability, and ROI endpoints.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from datetime import timedelta
from .models import Order, User, MachineSettings, ChartOfAccounts
from .accounting import AccountingService, KPICalculator


class SetupAccountsView(APIView):
    """Setup default chart of accounts (run once)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Admin only
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)
        
        accounts = AccountingService.setup_default_chart_of_accounts()
        
        return Response({
            'status': 'success',
            'message': f'{len(accounts)} accounts created',
            'accounts': [{'code': acc.code, 'name': acc.name} for acc in accounts.values()]
        })


class TrialBalanceView(APIView):
    """Get trial balance report"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        as_of_date_str = request.query_params.get('as_of_date')
        
        if as_of_date_str:
            from datetime import datetime
            as_of_date = datetime.strptime(as_of_date_str, '%Y-%m-%d').date()
        else:
            as_of_date = None
        
        trial_balance = AccountingService.get_trial_balance(as_of_date)
        
        return Response(trial_balance)


class BalanceSheetView(APIView):
    """Get  balance sheet"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        as_of_date_str = request.query_params.get('as_of_date')
        
        if as_of_date_str:
            from datetime import datetime
            as_of_date = datetime.strptime(as_of_date_str, '%Y-%m-%d').date()
        else:
            as_of_date = None
        
        balance_sheet = AccountingService.get_balance_sheet(as_of_date)
        
        return Response(balance_sheet)


class GrossMarginKPIView(APIView):
    """Calculate gross margin KPI"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        days = int(request.query_params.get('days', 30))
        
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        kpi = KPICalculator.calculate_gross_margin(start_date, end_date)
        
        return Response(kpi)


class OrderProfitabilityView(APIView):
    """Get profitability analysis for an order"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, order_id):
        try:
            analysis = KPICalculator.calculate_order_profitability(order_id)
            return Response(analysis)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)


class EmployeeROIView(APIView):
    """Calculate employee ROI"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, employee_id):
        days = int(request.query_params.get('days', 30))
        
        try:
            roi = KPICalculator.calculate_employee_roi(employee_id, days)
            return Response(roi)
        except User.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)


class MachineROIView(APIView):
    """Calculate machine ROI"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, machine_id):
        days = int(request.query_params.get('days', 90))
        
        try:
            roi = KPICalculator.calculate_machine_roi(machine_id, days)
            return Response(roi)
        except MachineSettings.DoesNotExist:
            return Response({'error': 'Machine not found'}, status=status.HTTP_404_NOT_FOUND)


class FinancialDashboardView(APIView):
    """Comprehensive financial dashboard"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get period
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Gross margin
        gross_margin = KPICalculator.calculate_gross_margin(start_date, end_date)
        
        # Balance sheet
        balance_sheet = AccountingService.get_balance_sheet()
        
        # Top profitable orders
        from .models import Order
        from django.db.models import F, ExpressionWrapper, DecimalField
        
        top_orders = Order.objects.filter(
            status__in=['completed', 'delivered'],
            completed_at__gte=start_date
        ).annotate(
            profit=ExpressionWrapper(
                F('total_price') - F('total_cost'),
                output_field=DecimalField()
            )
        ).order_by('-profit')[:5]
        
        top_orders_data = []
        for order in top_orders:
            top_orders_data.append({
                'order_number': order.order_number,
                'client': order.client.full_name,
                'revenue': float(order.total_price or 0),
                'cost': float(order.total_cost or 0),
                'profit': float((order.total_price or 0) - (order.total_cost or 0))
            })
        
        # Cash flow (simplified)
        from .models import Transaction
        transactions = Transaction.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        )
        
        income_total = transactions.filter(type='income').aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        expense_total = transactions.filter(type='expense').aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        net_cash_flow = float(income_total) - float(expense_total)
        
        return Response({
            'period': f"{start_date.date()} to {end_date.date()}",
            'gross_margin': gross_margin,
            'balance_sheet_summary': {
                'total_assets': balance_sheet['total_assets'],
                'total_liabilities': balance_sheet['total_liabilities'],
                'total_equity': balance_sheet['total_equity']
            },
            'cash_flow': {
                'income': float(income_total),
                'expenses': float(expense_total),
                'net': net_cash_flow
            },
            'top_profitable_orders': top_orders_data
        })


class RecordSaleView(APIView):
    """Manually record sale as journal entry"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, order_id):
        if request.user.role not in ['admin', 'accountant']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            order = Order.objects.get(id=order_id)
            entry = AccountingService.record_sale(order, request.user)
            
            return Response({
                'status': 'success',
                'journal_entry_id': entry.id,
                'message': f'Sale recorded for Order #{order.order_number}',
                'is_balanced': entry.is_balanced()
            })
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        except ChartOfAccounts.DoesNotExist:
            return Response({
                'error': 'Chart of accounts not setup. Run /api/accounting/setup/ first'
            }, status=status.HTTP_400_BAD_REQUEST)
